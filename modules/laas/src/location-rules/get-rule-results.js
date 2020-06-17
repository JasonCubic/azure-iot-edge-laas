const _ = require('lodash');

function getOneConditionResults(tagRead, condition) {
  // { operator: 'eq', value: this.$store.state.location.macAddress, path: 'mac_address' },
  const tagReadValue = _.get(tagRead, condition.path, undefined);
  const conditionValue = condition.value;
  switch (condition.operator) {
    case 'eq': return _.toString(tagReadValue) === _.toString(conditionValue);
    case 'ne': return _.toString(tagReadValue) !== _.toString(conditionValue);
    case 'gt': return _.toNumber(tagReadValue) > _.toNumber(conditionValue);
    case 'gte': return _.toNumber(tagReadValue) >= _.toNumber(conditionValue);
    case 'lt': return _.toNumber(tagReadValue) < _.toNumber(conditionValue);
    case 'lte': return _.toNumber(tagReadValue) <= _.toNumber(conditionValue);
    case 'in': return _.includes(tagReadValue, conditionValue);
    case 'notin': return !_.includes(tagReadValue, conditionValue);
    default: return false;
  }
}

// logic imitated from:  https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#boolean-expressions-all-and-any
// Boolean expressions: all and any
// Each rule's conditions must have either an all or an any operator at its root, containing an array of conditions.
// The all operator specifies that all conditions contained within must be truthy for the rule to be considered a success.
// The any operator only requires one condition to be truthy for the rule to succeed.

function getActionsForTag(tagRead, locationRules) {
  const truthyLocationRules = locationRules.reduce((accumulator, locationRule) => {
    let ruleIsTruthy = false;
    const allConditions = _.get(locationRule, 'conditions.all', []);
    if (allConditions.length > 0) {
      const allConditionResults = allConditions.map((condition) => getOneConditionResults(tagRead, condition));
      if (_.every(allConditionResults)) {
        ruleIsTruthy = true;
      }
    }
    const anyConditions = _.get(locationRule, 'conditions.any', []);
    if (anyConditions.length > 0) {
      const anyConditionResults = anyConditions.map((condition) => getOneConditionResults(tagRead, condition));
      if (_.some(anyConditionResults)) {
        ruleIsTruthy = true;
      }
    }
    if (ruleIsTruthy) {
      accumulator.push(_.get(locationRule, 'action', {}));
    }
    return accumulator;
  }, []);
  return truthyLocationRules;
}

function getTagEnrichedWithActions(actionsForTag, tagRead) {
  const initialLocation = _.get(tagRead, 'location', []);
  const newLocation = actionsForTag.reduce((acc, action) => {
    switch (action.type) {
      // eslint-disable-next-line no-param-reassign
      case 'add-tags': acc = acc.concat(_.get(action, 'params.tags', []));
        break;
      default:
        console.log('ERROR: undefined action type: ', action.type);
    }
    return acc;
  }, initialLocation);
  return ({ ...tagRead, location: newLocation });
}


function getRuleResults(tagCollection, locationRules) {
  return tagCollection.map((tagRead) => {
    const actionsForTag = getActionsForTag(tagRead, locationRules);
    if (actionsForTag.length === 0) {
      return tagRead;
    }
    return getTagEnrichedWithActions(actionsForTag, tagRead);
  });
}

module.exports = getRuleResults;
