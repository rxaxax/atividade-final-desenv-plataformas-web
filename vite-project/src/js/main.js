function registerForm() {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      // Capturar os dados do formulário
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());

      try {
        // Enviar dados para o servidor
        const response = await fetch("http://localhost:3000/usuario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        // Verificar a resposta do servidor
        if (response.ok) {
          const result = await response.json();
          alert(result.msg);
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("registerModal"),
          );
          modal.hide();
          event.target.reset();
          location.reload();
        } else {
          const error = await response.json();
          alert(error.msg);
        }
      } catch (error) {
        alert("Erro no servidor. Tente novamente mais tarde.");
        console.error(error);
      }
    });
}

function loginForm() {
  document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      // Capturar os dados do formulário
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());

      try {
        // Enviar dados para o servidor
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.token) {
          localStorage.setItem("id", result.id);
          localStorage.setItem("token", result.token);
          alert(result.msg);
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("loginModal"),
          );
          modal.hide();
          location.reload();
        } else {
          alert(result.msg || "Login inválido");
        }
      } catch (error) {
        alert("Erro no servidor. Tente novamente mais tarde.");
        console.error("Erro:", error);
      }
    });
}

async function checarAutenticacaoInicial() {
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você não está autenticado. Redirecionando para a página de login.");
    window.location.href = "/index.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/gestaoadmin/" + id, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Renderizar os dados na página
      document.getElementById("adminContent").innerHTML = `
          ${data.msg}
        `;
    }
  } catch (error) {
    alert("Erro ao acessar os dados. Tente novamente mais tarde.");
    console.error(error);
    window.location.href = "index.html";
  }
}

async function editCadastro() {
  const id = localStorage.getItem("id");

  document
    .getElementById("editForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      // Capturar os dados do formulário
      const formData = new FormData(event.target);

      const data = Object.fromEntries(
        [...formData.entries()].filter(([_, value]) => value),
      );

      try {
        // Enviar dados para o servidor
        const response = await fetch("http://localhost:3000/usuario/" + id, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        // Verificar a resposta do servidor
        if (response.ok) {
          alert(result.msg);
          event.target.reset();
          location.reload();
        }
      } catch (error) {
        alert("Erro no servidor. Tente novamente mais tarde.");
        console.error(error);
      }
    });
}

async function deleteCadastro() {
  const id = localStorage.getItem("id");

  const confirmacao = confirm(
    "Atenção, a exclusão da sua conta de usuário é irreversível! Deseja continuar assim mesmo?",
  );

  if (!confirmacao) {
    return location.reload();
  }

  try {
    // Enviar dados para o servidor
    const response = await fetch("http://localhost:3000/usuario/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    // Verificar a resposta do servidor
    if (response.ok) {
      alert(result.msg);
      localStorage.clear();
      alert("Redirecionando para a página inicial!");
      window.location.href = "/index.html";
    }
  } catch (error) {
    alert("Erro no servidor. Tente novamente mais tarde.");
    console.error(error);
  }
}

function btnSair() {
  localStorage.clear();
  alert("Usuário desconectado com sucesso!");
  window.location.href = "/index.html";
}

function usuarioLogado() {
  if (localStorage.length !== 0) {
    document
      .getElementById("btns-logged")
      .setAttribute("class", "d-flex gap-2");
    document
      .getElementById("btns-unlogged")
      .setAttribute("class", "d-none gap-2");
  } else {
    document
      .getElementById("btns-logged")
      .setAttribute("class", "d-none gap-2");
    document
      .getElementById("btns-unlogged")
      .setAttribute("class", "d-flex gap-2");
  }
}

async function consultarUsuarios() {
  try {
    const response = await fetch("http://localhost:3000/usuario/", {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json();
      const resultArr = Object.values(result);
      return resultArr;
    }
  } catch (error) {
    alert("Erro ao acessar os dados. Tente novamente mais tarde.");
    console.error(error);
  }
}
