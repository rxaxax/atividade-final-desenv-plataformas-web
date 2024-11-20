import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const consultaDB = async (callback) => {
  await mongoose.connect(uri, clientOptions);
  console.log("banco de dados on");

  try {
    const result = await callback();
    return result;
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("banco de dados off");
  }
};

export default consultaDB;
