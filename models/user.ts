import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exist!"],
    required: [true, "Email is required"],
  },
  // username: {
  //   type: String,
  //   required: [true, "Username is required!"],
  //   match: [
  //     /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
  //     "Username invalid, it should contain 8-20 alphanumeric letters and be unique!",
  //   ],
  // },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
    maxlength: 20,
    match: /^[a-zA-Z][a-zA-Z0-9_]{7,19}$/, // starts with letter, total 8–20
  },
  image: {
    type: String,
  },
  displayName: { type: String, required: true },
});

// The doc shape (no _id here; Mongoose will add it)
export type User = InferSchemaType<typeof UserSchema>;

// The model type for queries
export type UserModel = Model<User>;

const UserModel =
  (models.User as UserModel | undefined) ??
  model<User, UserModel>("User", UserSchema);

export default UserModel;
