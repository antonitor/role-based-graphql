const _merge = require("lodash.merge");

const { resolvers: userResolvers } = require("./schema/user");

const resolvers = _merge({}, userResolvers);

module.exports = resolvers;
