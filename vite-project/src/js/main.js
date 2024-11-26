document
.getElementById("registerForm")
.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Capturar os dados do formulário
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  try {
    // Enviar dados via fetch para o servidor
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
      alert(result.msg); // Exibir mensagem de sucesso
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("registerModal"),
      );
      modal.hide();
      event.target.reset(); // Limpar formulário
    } else {
      const error = await response.json();
      alert(error.msg); // Exibir mensagem de erro
    }
  } catch (error) {
    alert("Erro no servidor. Tente novamente mais tarde.");
    console.error(error);
  }
});

document
.getElementById("loginForm")
.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Capturar os dados do formulário
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  try {
    // Enviar dados via fetch para o servidor
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    //console.log(result);

    if (response.ok && result.token) {
      localStorage.setItem("id", result.id);
      localStorage.setItem("token", result.token);
      window.location.href = "/gestaoadmin.html"; // Redireciona para a página de administração
    } else {
      alert(result.msg || "Login inválido");
    }
  } catch (error) {
    alert("Erro no servidor. Tente novamente mais tarde.");
    console.error("Erro:", error);
  }
});