import "dotenv/config";
import mongoose from "mongoose";

const usuario_db = process.env.DB_USER
const senha_db = process.env.DB_PASSWORD

const uri = `mongodb+srv://${usuario_db}:${senha_db}@cluster0.qpfj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function consultaDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("[CONECTADO AO BANCO DE DADOS]");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
  }
}

export default consultaDB;
