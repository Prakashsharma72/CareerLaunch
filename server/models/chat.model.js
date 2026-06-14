import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Chat = db.define(
  "Chat",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
    },

    response: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "chats",
    timestamps: true,
  }
);

export default Chat;