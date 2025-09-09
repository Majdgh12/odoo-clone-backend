import mongoose from "mongoose";

const privateContactSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  street: String,
  street2: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  private_email: String,
  private_phone: String,
  home_work_distance: String,
  private_car_plate: String
});

const PrivateContact = mongoose.model("PrivateContact", privateContactSchema);
export default PrivateContact;
