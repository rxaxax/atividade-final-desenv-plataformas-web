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

/* ROTA PROTEGIDA */

app.get("/gestaoadmin/:id", checarToken, async (req, res) => {
  const id = req.params.id;

  const usuario = await Usuario.findById(id, "-senha");

  const adminData = {
    msg: `
     <main>
      <section class="mt-4" id="profile">
        <div class="container bg-overlay text-center d-flex flex-column">
          <div class="row">
            <div class="col">
              <h1 class="fs-2 pb-3">Usuário</h1>
              <div class="d-flex flex-row justify-content-center gap-5">
                <form class="d-flex flex-column text-start" id="editForm">
                  <div class="mb-2">
                    <label for="nome" class="form-label">Nome</label>
                    <input
                      id="nome"
                      name="nome"
                      placeholder="${usuario.nome}"
                      type="text"
                      class="form-control"
                    >
                  </div>
                  <div class="mb-2">
                    <label for="email" class="form-label">Email</label>
                    <input
                      id="email"
                      name="email"
                      placeholder="${usuario.email}"
                      type="email"
                      class="form-control"
                    >
                  </div>
                  <div class="mb-2">
                    <label for="senha" class="form-label">Senha</label>
                    <input
                      id="senha"
                      name="senha"
                      placeholder="********"
                      type="password"
                      class="form-control"
                    >
                  </div>
                  <button type="submit" class="h-25 btn btn-success btn-sm" onclick="editCadastro()">
                    Editar cadastro
                  </button>
                  <button type="button" class="h-25 btn btn-danger btn-sm mt-2" onclick="deleteCadastro()">
                    Excluir cadastro
                  </button>
                </form>
              </div>
            </div>
            <div class="col">
              <h1 class="fs-2 pb-3">Tabela</h1>
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Usuário</th>
                    <th scope="col">Email</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
      `,
  };

  return res.status(200).json(adminData);
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

/* INICIAR O SERVIDOR*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVIDOR RODANDO NA PORTA ${PORT}`);
  consultaDB();
});
