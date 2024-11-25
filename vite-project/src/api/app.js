import "dotenv/config";
import express from "express";
import cors from "cors";
import consultaDB from "./config/database.js";
import Usuario from "./models/usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* INICIALIZAR O APP */
const app = express();

/* MIDDLEWARES */
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
function checarToken(req, res, next) {
  const reqHeader = req.headers["authorization"];
  const token = reqHeader && reqHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (e) {
    res.status(404).json({ msg: "Token inválido!" });
  }
}

/* ROTA PÚBLICA */

app.get("/", async (req, res) => {
  res.status(200).json({ msg: "API funcionando!" });
});

/* ROTA PRIVADA */

app.get("/usuario/:id", checarToken, async (req, res) => {
  const id = req.params.id;

  consultaDB(async () => {
    const usuario = await Usuario.findById(id, "-senha");

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado!",
      });
    }

    res.status(200).json({ usuario });
  });
});

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

/* ROTA DE REGISTRO DE USUARIO */

app.post("/register", async (req, res) => {
  const { nome, email, senha, confirmacaoSenha } = req.body;

  //validações
  if (!nome) {
    return res.status(422).json({ msg: "O campo 'nome' é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O campo 'email' é obrigatório!" });
  }

  if (!senha) {
    return res.status(422).json({ msg: "O campo 'senha' é obrigatório!" });
  }

  if (senha && !confirmacaoSenha) {
    return res
      .status(422)
      .json({ msg: "A confirmação da senha no campo adequado é obrigatória!" });
  }
  if (senha !== confirmacaoSenha) {
    return res.status(422).json({ msg: "As senhas não coincidem!" });
  }

  consultaDB(async () => {
    // verificar existencia de usuario

    const usuarioExiste = await Usuario.findOne({ email: email });
    if (usuarioExiste) {
      return res.status(422).json({
        msg: `O endereço de email ${email} já possui cadastro!`,
      });
    }

    // criptografia da senha
    const senhaCripto = await bcrypt.hash(senha, 8);
    // criar usuario
    const usuario = new Usuario({
      nome,
      email,
      senha: senhaCripto,
    });

    try {
      await usuario.save();
      res.status(201).json({
        msg: "Seu cadastro foi realizado com sucesso!",
      });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ msg: "Erro no servidor, tente novamente mais tarde!" });
    }
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

// app.put ()
// app.delete()

/* INICIAR O SERVIDOR */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SERVIDOR RODANDO NA PORTA ${PORT}`));
