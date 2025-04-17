const postListDiv = document.getElementById("post-list"); // ID corrigido
const postContentDiv = document.getElementById("post-content");
const backButton = document.getElementById("back-button");
const filterButtonsContainer = document.getElementById("filter-buttons");

let currentFilter = "todos";
let allPosts = []; // Variável para armazenar todos os posts carregados do JSON

// Função para buscar os posts do JSON
async function fetchPosts() {
  try {
    const response = await fetch("posts.json"); // Busca o arquivo JSON
    if (!response.ok) {
      throw new Error(
        `Erro ao carregar posts.json: ${response.statusText}`
      );
    }
    allPosts = await response.json(); // Armazena os posts na variável global
    renderPostList(); // Renderiza a lista inicial após carregar os posts
    showPostList(); // Garante que a lista seja exibida
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    postListDiv.innerHTML = "<p>Erro ao carregar a lista de textos.</p>";
  }
}

// Função para mostrar a lista de posts e esconder o conteúdo individual
function showPostList() {
  postContentDiv.innerHTML = "";
  postContentDiv.style.display = "none";
  backButton.style.display = "none";
  postListDiv.style.display = "block";
  filterButtonsContainer.style.display = "block"; // Mostra os botões de filtro
}

// Função para carregar e exibir um post específico
async function loadPost(mdFile) {
  try {
    const response = await fetch(mdFile);
    if (!response.ok) {
      throw new Error(
        `Erro ao carregar ${mdFile}: ${response.statusText}`
      );
    }
    const markdownWithFrontMatter = await response.text();

    // ... (lógica de remoção do front matter e conversão para HTML permanece a mesma)
    const contentStartIndex = markdownWithFrontMatter.indexOf("\n---", 4);
    const markdown =
      contentStartIndex > 0
        ? markdownWithFrontMatter.substring(contentStartIndex + 4)
        : markdownWithFrontMatter;
    const htmlContent = marked.parse(markdown);

    // Encontra o post correspondente em allPosts para obter o título
    const postData = allPosts.find((p) => p.file === mdFile);
    const title = postData ? postData.title : "Título não encontrado";

    postContentDiv.innerHTML = `
              <article>
                  <h2>${title}</h2>
                  ${htmlContent}
              </article>
          `;
    postListDiv.style.display = "none";
    postContentDiv.style.display = "block";
    backButton.style.display = "block";
    filterButtonsContainer.style.display = "none"; // Esconde os botões de filtro ao ver um post
  } catch (error) {
    console.error("Erro:", error);
    postContentDiv.innerHTML = `<p>Não foi possível carregar o texto. Tente novamente mais tarde.</p>`;
    postListDiv.style.display = "none";
    postContentDiv.style.display = "block";
    backButton.style.display = "block";
    filterButtonsContainer.style.display = "none"; // Esconde os botões de filtro em caso de erro
  }
}

// Função para gerar a lista de links dos posts, filtrada pela tag
function renderPostList() {
  // Usa allPosts em vez da variável local 'posts'
  const filteredPosts = allPosts.filter(
    (post) =>
      currentFilter === "todos" ||
      (post.tags && post.tags.includes(currentFilter))
  );

  if (filteredPosts.length === 0 && allPosts.length > 0) {
    // Verifica se allPosts já foi carregado
    postListDiv.innerHTML = `<p>Nenhum texto encontrado para a tag "${currentFilter}".</p>`;
    return;
  } else if (allPosts.length === 0) {
    postListDiv.innerHTML = `<p>Carregando textos...</p>`; // Mensagem enquanto carrega
    return;
  }

  let listHtml = "<ul>";
  filteredPosts.forEach((post) => {
    listHtml += `<li><a href="#" onclick="loadPost('${post.file}'); return false;">${post.title}</a></li>`;
  });
  listHtml += "</ul>";
  postListDiv.innerHTML = listHtml;

  // ... (lógica para atualizar a classe 'active' nos botões permanece a mesma)
  const buttons = filterButtonsContainer.querySelectorAll("button");
  buttons.forEach((button) => {
    let buttonTag = button.textContent.toLowerCase().replace("s", ""); // Simplifica a comparação (Contos -> conto)
    if (buttonTag === "todo") buttonTag = "todos"; // Ajuste para 'Todos'

    if (buttonTag === currentFilter) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// Função chamada pelos botões de filtro
function filterPosts(tag) {
  currentFilter = tag;
  renderPostList();
  showPostList();
}

// Event listener para o botão voltar (manter apenas um)
backButton.addEventListener("click", showPostList);

// Inicialização: Busca os posts do JSON ao carregar a página
fetchPosts(); // Chama a nova função para buscar os dados
