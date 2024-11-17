const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.urlencoded({ extended: true }))
const port = 3000;

const Usuario = mongoose.model("Usuario", {
  nome: String,
  email: String,
  senha: String,
});

app.listen(port, () => {
  mongoose.connect("mongodb+srv://admdb:tiCSTWYuC3mj6ti5@cluster0.qpfj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  console.log(`App rodando na porta ${port}`);
});

// ROTAS

app.post("/post", async (req, res) => {

  //console.log(req.body)

  const usuario = new Usuario({
     nome: req.body.nome,
     email: req.body.email,
     senha: req.body.senha,
   });

   await usuario.save();
   res.send(`Tudo certo ${usuario.nome}!
    Seu cadastro foi concluído com sucesso.`);
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
