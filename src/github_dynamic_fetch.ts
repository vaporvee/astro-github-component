interface Repository {
  stargazers_count: number;
  forks_count: number;
}

class GithubCard extends HTMLElement {
  public owner: string;
  public repo: string;
  private cachedData: Repository | null = null;
  public cached: boolean;

  constructor() {
    super();
    this.repo = this.getAttribute("repo") as string;
    this.owner = this.getAttribute("owner") as string;
  }

  static async fetchRepository(owner: string, repo: string): Promise<Repository | null> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!response.ok) {
      console.log('Failed to fetch repository');
      return null;
    } else {
      const data: Repository = await response.json();
      return data;
    }
  }

  update_string() {
    if (this.cachedData) {
      if (this.cachedData.forks_count != 0) {
        showElement(this, "gh_fork_icon");
        setString(this, "gh_forks", this.cachedData.forks_count.toString());
      }
      if (this.cachedData.stargazers_count != 0) {
        showElement(this, "gh_star_icon");
        setString(this, "gh_stars", this.cachedData.stargazers_count.toString());
      }
    }
  }

  async update(): Promise<void> {
    const cachedDataKey = `githubCardData_${this.owner}_${this.repo}`;
    let cachedData = localStorage.getItem(cachedDataKey);
    if (cachedData) {
      this.cached = true
      this.cachedData = JSON.parse(cachedData);
      this.update_string();
    }

    try {
      const freshData = await GithubCard.fetchRepository(this.owner, this.repo);
      if (freshData) {
        this.cachedData = freshData;
        localStorage.setItem(cachedDataKey, JSON.stringify(freshData));
        this.update_string();
      }
    } catch (error) {
      console.log('Failed to fetch repository data:', error);
    }
  }
}

customElements.define('gh-card', GithubCard);
async function updateCards() {
  const notCachedCards = Array.from(document.querySelectorAll('gh-card') as NodeListOf<GithubCard>).filter(card =>
    !card.cached
  );
  await Promise.all(notCachedCards.map(async (card) => {
    await card.update();
  }));

  const cachedCards = Array.from(document.querySelectorAll('gh-card') as NodeListOf<GithubCard>).filter(card =>
    card.cached
  );
  await Promise.all(cachedCards.map(async (card) => {
    await card.update();
  }));
}
updateCards()

function setString(card: GithubCard, elementID: string, value: string | number) {
  const element = card.querySelector(`#${elementID}`);
  if (element) {
    element.textContent = value.toString();
  }
}

function showElement(card: GithubCard, elementID: string) {
  const element: HTMLElement = card.querySelector(`#${elementID}`);
  if (element) {
    element.style.visibility = "initial";
  }
}
