import "dotenv/config";
import express from "express";
import cors from "cors";
import consultaDB from "./config/database.js";
import Usuario from "./models/usuario.js";
import bcrypt from "bcrypt";

// Inicializar o app
const app = express();

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rotas básicas
app.get("/", (req, res) => {
  res.send("API está funcionando!");
});

app.get("/usuarios", async (req, res) => {
  consultaDB(async () => {
    const usuarios = await Usuario.find();
    res.send(usuarios);
  });
});

app.post("/cadastro", async (req, res) => {
  if (await Usuario.exists({ email: req.body.email })) {
    res.send(`O endereço de email ${req.body.email} já possui cadastro!`);
  } else {
    const senhaCripto = await bcrypt.hash(req.body.senha, 8);

    const usuario = new Usuario({
      nome: req.body.nome,
      email: req.body.email,
      senha: senhaCripto,
    });

    await usuario.save();
    res.send(`Tudo certo ${usuario.nome}!
      Seu cadastro foi concluído com sucesso.`);
  }
});


