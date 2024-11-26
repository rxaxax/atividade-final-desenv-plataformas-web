import "dotenv/config";
import express from "express";
import cors from "cors";
import consultaDB from "./config/database.js";
import Usuario from "./models/usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { router, checarToken } from "./routes/usuarioRoutes.js";

/* INICIALIZAR O APP */
const app = express();
const usuarioRoutes = router;

/* MIDDLEWARES */
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/usuario", usuarioRoutes);

/* ROTA PÚBLICA */

app.get("/", async (req, res) => {
  res.status(200).json({ msg: "API funcionando!" });
});

/* ROTA PRIVADA */

app.get("/gestaoadmin/:id", checarToken, async (req, res) => {
  // Exemplo de dados administrativos

  const id = req.params.id;

  consultaDB(async () => {
    const usuario = await Usuario.findById(id, "-senha");

    const adminData = {
      msg: `Olá ${usuario.nome}! Seja bem-vindo à área de administração!`,
    };

    res.status(200).json(adminData);
  });
});

/* ROTA DE LOGIN */

app.post("/login", async (req, res) => {
  const { loginEmail, loginSenha } = req.body;

  //validações
  if (!loginEmail) {
    return res.status(422).json({ msg: "O campo 'email' é obrigatório!" });
  }

  if (!loginSenha) {
    return res.status(422).json({ msg: "O campo 'senha' é obrigatório!" });
  }

  consultaDB(async () => {
    //verificar existencia de usuario
    const usuario = await Usuario.findOne({ email: loginEmail });
    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado!",
      });
    }

    //checar senha
    const checarSenha = await bcrypt.compare(loginSenha, usuario.senha);
    if (!checarSenha) {
      return res.status(422).json({
        msg: "Senha inválida!",
      });
    }

    //criar token e enviar para o cliente
    try {
      const secret = process.env.SECRET;
      const token = jwt.sign({ id: usuario._id }, secret);
      res.status(200).json({
        msg: "Autenticação realizada com sucesso!",
        id: usuario._id,
        token,
      });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde!" });
    }
  });
});

/* INICIAR O SERVIDOR*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SERVIDOR RODANDO NA PORTA ${PORT}`));
