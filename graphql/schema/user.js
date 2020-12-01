const { gql, UserInputError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const config = require("../../utils/config");
const User = require("../../models/user");
const bcrypt = require("bcrypt");

const typeDef = gql`
  enum Roles {
    USER
    SALES
    ADMIN
    ROOT
  }
  type User {
    username: String!
    name: String
    role: Roles!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    users: [User]!
    me: User
  }
  type Mutation {
    createUser(
      username: String!
      password: String!
      name: String
      role: String
    ): User
    login(username: String!, password: String!): Token
    editRole(username: String!, role: String!): User
    editName(username: String!, name: String!): User
  }
`;

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser;
    },
    users: (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      return User.find({});
    },
  },
  Mutation: {
    createUser: async (root, args, context) => {
      try {
        const currentUser = context.currentUser;

        if (!currentUser) {
          throw new AuthenticationError("not authenticated");
        }

        console.log(context.currentUser);

        if (currentUser.role !== "root") {
          console.log("NO PERMISSION");
          throw new AuthenticationError("Not Enought Permissions");
        }

        const passwordHash = await bcrypt.hash(args.password, 10);
        const user = new User({
          username: args.username,
          passwordHash: passwordHash,
          name: args.name,
          role: args.role,
        });
        const savedUser = await user.save();
        return savedUser;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      try {
        const user = await User.findOne({ username: args.username });
        const passwordCorrect =
          user === null
            ? false
            : await bcrypt.compare(args.password, user.passwordHash);

        if (!(user && passwordCorrect)) {
          throw new AuthenticationError("Invalid username or password");
        }
        const userForToken = {
          username: user.username,
          id: user._id,
        };
        const token = jwt.sign(userForToken, config.SECRET);
        return { value: token };
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
  },
};

module.exports = { typeDef, resolvers };
