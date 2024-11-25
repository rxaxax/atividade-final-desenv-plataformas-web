import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function consultaDB(callback) {
  await mongoose.connect(uri, clientOptions);
  console.log("[CONECTADO AO DB]");

  try {
    const result = await callback();
    console.log("[PROCESSANDO REQUISIÇÃO...]");

    return result;
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("[DB DESCONECTADO]");
  }
}

export default consultaDB;
