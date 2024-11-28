import { Router } from "express";
import cors from "cors";
import Usuario from "../models/usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

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
    console.log(e);
    res.status(404).json({ msg: "Token inválido!" });
  }
}

// CREATE
router.post("/", async (req, res) => {
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

  try {
    // verificar existência do usuario
    const usuarioExiste = await Usuario.findOne({ email: email });
    if (usuarioExiste) {
      return res.status(422).json({
        msg: `O endereço de email ${email} já possui cadastro!`,
      });
    }

    // criar usuario
    const senhaCripto = await bcrypt.hash(senha, 8);
    const usuario = new Usuario({
      nome,
      email,
      senha: senhaCripto,
    });
    // salvar usuario no banco de dados
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

// READ
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, { senha: 0 });

    if (!usuarios) {
      return res.status(404).json({
        msg: "Nenhum usuário foi encontrado!",
      });
    }
    res.status(200).json(usuarios);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ msg: "Erro no servidor, tente novamente mais tarde!" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await Usuario.findById(id, "-senha");

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado!",
      });
    }

    res.status(200).json(usuario);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ msg: "Erro no servidor, tente novamente mais tarde!" });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { nome, email, senha } = req.body;

  const usuario = Object.fromEntries(
    Object.entries({ nome, email, senha }).filter(
      ([_, value]) => value != null,
    ),
  );

  console.log("senha: ", senha);

  if (senha) {
    const senhaCripto = await bcrypt.hash(senha, 8);
    usuario.senha = senhaCripto;
  }

  try {
    const atualizacao = await Usuario.updateOne({ _id: id }, usuario);

    console.log("matchedCount :", atualizacao.matchedCount);

    if (!atualizacao.matchedCount) {
      return res.status(422).json({ msg: "Nenhuma alteração enviada!" });
    }

    res.status(200).json({ msg: "Usuário atualizado!" });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ msg: "Erro no servidor, tente novamente mais tarde!" });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await Usuario.findById(id, "-senha");

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado!",
      });
    }

    await Usuario.deleteOne({ _id: id });

    res.status(200).json({ msg: "Usuário removido com sucesso!" });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ msg: "Erro no servidor, tente novamente mais tarde!" });
  }
});

export { router, checarToken };
