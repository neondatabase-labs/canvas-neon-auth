import {
  createSchema,
  table,
  string,
  number,
  ANYONE_CAN,
  definePermissions,
  ExpressionBuilder,
  PermissionsConfig
} from "@rocicorp/zero";
import { getUserId } from './utils/helpers';

// Define the post-it table
const postIts = table("post_its")
  .columns({
    id: string(),
    content: string(),
    position_x: number(),
    position_y: number(),
    color: string(),
    created_at: number(),
    updated_at: number(),
    created_by: string(),
    size_width: number(),
    size_height: number(),
    z_index: number(),
  })
  .primaryKey("id");

// Define the user_cursors table
const userCursors = table("user_cursors")
  .columns({
    user_id: string(),
    x: number(),
    y: number(),
    updated_at: number(),
  })
  .primaryKey("user_id");

// Create and export the schema
export const schema = createSchema({
  tables: [postIts, userCursors],
});
// Export types for use in our app
export type Schema = typeof schema;

// Update AuthData to use cookie-based userId
type AuthData = {
  userId: string;
};

// Function to get current auth data
export const getCurrentAuthData = (): AuthData => {
  return {
    userId: getUserId()
  };
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {

  const allowIfPostItsCreator = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "post_its">
  ) => cmp("created_by", "=", authData.userId);

  return {
    post_its: {
      row: {
        // anyone can insert
        insert: ANYONE_CAN,
        update: {
          // user can only edit their own post-its
          preMutation: ANYONE_CAN,
          postMutation: ANYONE_CAN,
        },
        // user can only delete their own post-its
        delete: ANYONE_CAN,
        // everyone can read post-its
        select: ANYONE_CAN,
      },
    },
    user_cursors: {
      row: {
        insert: ANYONE_CAN,
        update: {
          preMutation: ANYONE_CAN,
          postMutation: ANYONE_CAN,
        },
        select: ANYONE_CAN
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});