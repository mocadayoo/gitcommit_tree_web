class CommitLogs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    static get getAttributes() {
        return ["user", "repo"];
    }

    connectedCallback() {
        this.show();
    }

    async fetchCommits(user, repo) {
        const resp = await fetch(
            `https://api.github.com/repos/${user}/${repo}/commits`,
        );
        if (!resp.ok) return [];
        return await resp.json();
    }

    async show() {
        const user = this.getAttribute("user");
        const repo = this.getAttribute("repo");

        if (!user || !repo) {
            return console.log("user or repo does not set. please do");
        }

        const commits = await this.fetchCommits(user, repo);

        const dateGroup = commits.reduce((acc, commit) => {
            const date = new Date(commit.commit.author.date);
            const title = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });

            if (!acc[title]) acc[title] = [];
            acc[title].push({
                shortMessage: commit.commit.message.split("\n")[0],
                hash: commit.sha,
            });
            return acc;
        }, {});

        this.shadowRoot.innerHTML = `
            <style>:host{--dot-size:.6rem;--hover-color:#f97316;--line-color:#e1e4e8;--line-width:.15rem}.commit_list_views{padding:0;margin:0;list-style-type:none;width:fit-content}.commit{font-size:14px;display:flex;align-items:flex-start;gap:8px;padding-bottom:20px;position:relative}.commit:last-child{padding-bottom:0}.commit:not(:last-child)::before{content:"";display:block;position:absolute;left:calc(var(--dot-size) / 2 + var(--line-width) / 2);top:5px;bottom:-5px;width:var(--line-width);background-color:var(--line-color)}.commit_tree_dot{transition:transform .2s}.commit_text{padding-left:1.2rem;transform-origin:left;transition:transform .2s}.commit>.commit_tree_dot{margin-top:.3rem;position:absolute;width:var(--dot-size);height:var(--dot-size);border-radius:50%;border:solid 2px var(--line-color);z-index:1;flex-shrink:0;background-color:#fff;transition:border .2s}.commit_hash{color:#999;margin-left:8px;font-size:.68rem;padding:.22rem;border-radius:.2rem .25rem;background-color:var(--line-color)}.commit:hover>.commit_tree_dot{border:solid 2px var(--hover-color);transform:scale(1.2)}.commit:hover>.commit_text{transform:scale(1.05)}</style>
            <div class="commit_logs">
                ${Object.entries(dateGroup).map(([date, items]) => `
                    <h4>${date}</h4>
                    <ul class="commit_list_views">
                        ${items.map((c) => `
                            <li class="commit">
                                <div class="commit_tree_dot"></div>
                                <div class="commit_text">
                                    <span>${c.shortMessage}</span>
                                    <label class="commit_hash">${c.hash.substring(0,6)}</label>
                                </div>
                            </li>
                        `).join("")}
                    </ul>
                `).join("")}
            </div>
        `;
    }
}

customElements.define('commit-logs', CommitLogs);