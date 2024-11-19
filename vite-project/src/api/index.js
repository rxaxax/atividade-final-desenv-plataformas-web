import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 3000;

const Usuario = mongoose.model("Usuario", {
  nome: String,
  email: String,
  senha: String,
});

app.listen(port, () => {
  mongoose.connect(process.env.MONGO_URL);
  console.log(`App rodando na porta ${port}`);
});

// ROTAS

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

app.post("/login", async (req, res) => {
  const usuario = await Usuario.findOne({ email: req.body.email });

  if (usuario) {
    if (await bcrypt.compare(req.body.senha, usuario.senha)) {
      res.send(`login bem sucedido`);
    } else {
      res.send(`senha incorreta`);
    }
  } else {
    res.send(`usuario não cadastrado`);
  }
});

app.get("/get", async (req, res) => {
  const usuarios = await Usuario.find();
  res.send(usuarios);
});

app.delete("/:id", async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  res.send(usuario);
});

app.put("/:id", async (req, res) => {
  const usuario = await Usuario.findByIdAndUpdate(
    req.params.id,
    {
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
    },
    {
      new: true,
    }
  );
  res.send(usuario);
});
