import colors from './colors.json';

export interface Repository {
  color: string;
  description: string;
  language: string;
}

export const fetchGithubStaticData = async (owner: string, repo: string, token: string = ""): Promise<Repository> => {
  const empty_data: Repository = {
    color: "#fff",
    description: "",
    language: "Other",
  }
  try {
    var headers: RequestInit
    if (token != "") {
      headers = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, headers);
    const data: Repository = await response.json();
    if (!response.ok) {
      return empty_data;
    }
    data.color = colors[data.language].color
    return data;
  } catch {
    return empty_data;
  }

}