// Build physical A4 sheets before opening the browser's print dialog.
// CSS owns all measurements; DOM measurement keeps font and wrapping changes safe.
(async function () {
  const source = document.getElementById("print-source");
  const pages = document.getElementById("print-pages");
  const button = document.getElementById("print-document");
  const status = document.getElementById("print-status");

  function copy(node) {
    const result = node.cloneNode(true);
    result.removeAttribute("id");
    result.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
    return result;
  }

  function newPage(sectionClass) {
    const sheet = document.createElement("div");
    sheet.className = "print-sheet";
    const content = document.createElement("div");
    content.className = "print-sheet-content main-wrapper";
    const section = document.createElement("section");
    section.className = "section " + sectionClass;
    content.append(section);
    sheet.append(content);
    pages.append(sheet);
    return { content, section };
  }

  function fits(page) {
    return page.section.getBoundingClientRect().bottom <=
      page.content.getBoundingClientRect().bottom + 0.5;
  }

  // A project longer than a sheet is split at list-item boundaries. Repeat its
  // title and detail label so each fragment retains context.
  function fragments(project) {
    if (!project.querySelector(".project-title")) {
      // Career descriptions may also grow beyond one sheet.
      const details = project.querySelector(".details");
      if (details && Array.from(details.children).some(block => !["P", "UL", "OL"].includes(block.tagName))) {
        throw new Error("긴 경력 설명의 표·제목 등은 자동 분할을 지원하지 않습니다. 문단이나 목록으로 작성해 주세요.");
      }
      return Array.from(project.querySelectorAll(".details > p, .details > ul > li, .details > ol > li")).map(block => {
        const item = document.createElement("div");
        item.className = "item";
        const details = document.createElement("div");
        details.className = "details";
        if (block.tagName === "LI") {
          const list = document.createElement(block.parentElement.tagName);
          list.append(copy(block));
          details.append(list);
        } else {
          details.append(copy(block));
        }
        item.append(copy(project.querySelector(".meta")), details);
        return item;
      });
    }
    return Array.from(project.querySelectorAll(".project-detail-section")).flatMap(detail =>
      Array.from(detail.querySelectorAll("dd > ul > li")).map(line => {
        const item = document.createElement("div");
        item.className = "item";
        const title = copy(project.querySelector(".project-title"));
        const list = document.createElement("dl");
        list.className = "project-details";
        const part = copy(detail);
        part.querySelector("ul").replaceChildren(copy(line));
        list.append(part);
        item.append(title, list);
        return item;
      })
    );
  }

  function placeGroup(sectionClass, headings, items) {
    if (!items.length) return;
    let page = newPage(sectionClass);
    headings.forEach(heading => page.section.append(copy(heading)));

    function appendPart(part) {
      page.section.append(part);
      if (fits(page)) return;
      part.remove();
      if (page.section.querySelector(".item")) {
        page = newPage(sectionClass);
        page.section.append(part);
        if (fits(page)) return;
        part.remove();
      }

      // A single paragraph/list item can itself exceed a sheet. Find the
      // largest Unicode-safe text prefix that fits; do not cut or drop text.
      const textElement = part.querySelector(".project-details li, .details p, .details li");
      const characters = Array.from(textElement.textContent);
      page.section.append(part);
      let low = 1;
      let high = characters.length;
      let split = 0;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        textElement.textContent = characters.slice(0, middle).join("");
        if (fits(page)) {
          split = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      if (!split) throw new Error("제목 영역이 한 페이지를 초과합니다. 제목·회사 정보를 줄여 주세요.");
      textElement.textContent = characters.slice(0, split).join("");
      if (split === characters.length) return;
      const next = copy(part);
      next.querySelector(".project-details li, .details p, .details li").textContent = characters.slice(split).join("");
      const title = next.querySelector(".project-title");
      if (title && !title.textContent.endsWith(" (계속)")) title.append(" (계속)");
      page = newPage(sectionClass);
      appendPart(next);
    }

    items.forEach(original => {
      const item = copy(original);
      page.section.append(item);
      if (fits(page)) return;
      item.remove();

      // Move the item to a fresh sheet only when the current one already has
      // content. This prevents leaving section/company headings by themselves.
      if (page.section.querySelector(".item")) {
        page = newPage(sectionClass);
        page.section.append(item);
        if (fits(page)) return;
        item.remove();
      }

      const parts = fragments(original);
      if (!parts.length) throw new Error("출력 항목을 나눌 본문이 없습니다. 항목 구성을 확인해 주세요.");
      parts.forEach((part, index) => {
        const title = part.querySelector(".project-title");
        if (index > 0 && title) title.append(" (계속)");
        appendPart(part);
      });
    });
  }

  try {
    await document.fonts.ready;
    const experience = source.querySelector(".experiences-section");
    if (experience) {
      placeGroup("experiences-section", [experience.querySelector(".section-title")],
        Array.from(experience.querySelectorAll(".item")));
    }
    const projects = source.querySelector(".projects-section");
    const groups = projects ? Array.from(projects.querySelectorAll(".project-group"))
      .filter(group => group.querySelector(".item")) : [];
    groups.forEach((group, index) => {
      const headings = [group.querySelector(".project-group-header")];
      if (index === 0) headings.unshift(projects.querySelector(".section-title"));
      placeGroup("projects-section", headings, Array.from(group.querySelectorAll(".item")));
    });
    if (!pages.children.length) throw new Error("출력할 경력 또는 프로젝트가 없습니다.");
    source.hidden = true;
    document.body.classList.add("print-ready");
    button.disabled = false;
    status.textContent = "A4 · " + pages.children.length + "페이지 · 배율 100%, 여백 없음으로 출력하세요.";
    button.addEventListener("click", () => window.print());
    if (new URLSearchParams(window.location.search).has("dialog")) {
      requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    }
  } catch (error) {
    pages.replaceChildren();
    status.textContent = "출력 준비 실패: " + error.message;
    console.error(error);
  }
})();
