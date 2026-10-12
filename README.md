# 윤경식 기술 경력서

Go·OpenStack·Kubernetes 기반 백엔드 개발 경험을 소개하는 개인 기술 경력서입니다.
Jekyll로 HTML과 CSS를 생성하고 GitHub Pages에서 제공합니다.

- 공개 페이지: https://gyeongsik97.github.io/
- 일반 화면: 소개, 경력, 주요 업무 및 프로젝트, 자격증, 기술 스택
- 보조 정보: 학력, 교육, 병역, 언어, 취미
- 출력 화면: 경력과 주요 업무 및 프로젝트만 포함

## 기술 구성

Ruby / Jekyll / Liquid / YAML / SCSS / 브라우저 JavaScript를 사용합니다.
별도 Node.js 빌드나 프런트엔드 패키지 설치는 필요하지 않습니다.
Bootstrap, 아이콘 라이브러리, 외부 PDF 변환 서비스에 의존하지 않습니다.
의존성 버전은 `Gemfile.lock`으로 관리합니다.

## 저장소 구조

| 경로 | 역할 |
| --- | --- |
| `_data/data.yml` | 프로필과 경력서의 모든 내용 |
| `_config.yml` | 사이트 제목·URL·로컬 서버·빌드 제외 설정 |
| `index.html` | 일반 화면의 섹션 순서 |
| `print.html` | 인쇄/PDF에 포함할 섹션 |
| `_layouts/default.html` | 상단 프로필·출력 링크·본문·보조 정보 배치 |
| `_layouts/print.html` | 출력 원본, A4 페이지 컨테이너, 출력 상태 및 버튼 |
| `_includes/` | 각 내용 섹션과 공통 head·연락처 |
| `assets/css/main.scss` | 스타일 진입점과 SCSS import 순서 |
| `_sass/_base.scss` | 공통 기본값, 목록·버튼·프로젝트 구조 |
| `_sass/_resume-layout.scss` | 화면/출력 공통 글꼴·본문 디자인, 반응형 화면 배치 |
| `_sass/_print.scss` | A4 용지 크기, 반복 여백, 출력 전용 스타일 |
| `assets/js/print.js` | 실제 렌더링 높이에 따른 출력 페이지 구성과 인쇄 호출 |
| `assets/images/id_photo.jpg` | 프로필 사진 |
| `assets/images/favicon.svg` | 브라우저 탭 아이콘 |
| `scripts/check.rb` | 빌드 결과의 내용·정적 파일·링크 검사 |
| `docs/` | 개인 작업 자료. Git 및 사이트 빌드에서 제외 |
| `_site/` | 자동 생성 결과. 직접 수정하거나 커밋하지 않음 |

### 내용 수정

`_data/data.yml`에서 다음 키를 편집합니다.

- `profile`: 이름, 직무, 사진, 이메일, GitHub
- `career-profile`: 소개
- `experiences`: 직급, 회사·팀, 기간, 경력 설명
- `projects.groups`: 회사별 프로젝트 묶음
- `certifications`, `skills`: 자격증과 기술 스택
- `education`, `training`, `military`, `languages`, `interests`: 보조 정보

경력의 `details: |`와 소개의 `summary: |`는 Markdown입니다.
프로젝트는 구조화된 목록을 사용하며, 각 문자열은 텍스트로 표시됩니다.

```yaml
projects:
  title: 주요 업무 및 프로젝트
  groups:
  - name: 제품 또는 업무 묶음
    meta: 회사명 · 기간
    assignments:
    - title: 개별 프로젝트
      sections:
      - label: 개요
        items:
        - 작업이 필요했던 배경이나 사용자 요구
      - label: 주요 수행 내용
        items:
        - 직접 담당한 작업과 해결 방향
      - label: 결과
        items:
        - 확인된 검증 결과 또는 성과
```

결과는 근거가 있을 때만 추가합니다. 내용이 적은 항목에 결과를 강제로 채우지 않습니다.
들여쓰기는 탭 대신 공백을 사용합니다.
고객명·내부 주소·비공개 업무 자료는 공개 데이터에 넣기 전에 확인합니다.

### 스타일 수정

화면과 인쇄에 공통인 제목·글꼴·설명 배치는 `_resume-layout.scss`의
`resume-document` 믹스인에서 관리합니다. 화면에만 필요한 카드·프로필·모바일 배치는
같은 파일의 `@media screen` 안에 있습니다.

큰 프로젝트 묶음 사이 구분선과 개별 프로젝트 여백은 `_base.scss`에서 관리합니다.
출력 용지 크기나 여백은 `_print.scss`에서 관리합니다.
레이아웃 HTML에 인라인 CSS를 추가하지 않습니다.

## WSL Ubuntu 개발 환경

명령은 Windows PowerShell이 아닌 WSL Ubuntu 터미널에서 실행합니다.
저장소는 파일 감시 성능을 위해 `/mnt/c`보다 WSL Linux 파일 시스템에 두는 편이 좋습니다.
현재 개발 환경은 Ruby 3.3 계열을 사용합니다.

### 최초 설치

```bash
sudo apt update
sudo apt install -y ruby-full build-essential zlib1g-dev
ruby --version
gem --version
```

사용자 gem 실행 경로를 현재 터미널에 등록합니다.

```bash
export PATH="$(ruby -r rubygems -e 'puts Gem.user_dir')/bin:$PATH"
gem install bundler --user-install
```

새 터미널에서도 적용하려면 위 `export PATH=...` 줄을 `~/.bashrc`에 한 번 추가하고
`source ~/.bashrc`를 실행합니다. gem 설치에 `sudo`를 사용하지 않습니다.

저장소 루트에서 실행합니다.

```bash
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll --version
```

`vendor/bundle`과 `.bundle`은 로컬 의존성/설정이며 커밋하지 않습니다.
Jekyll을 별도로 전역 설치할 필요는 없습니다.

### 실행과 확인

```bash
bundle exec jekyll serve --livereload
```

Windows 브라우저에서 다음 주소를 엽니다.

- 일반 화면: http://localhost:4000/
- 출력 미리보기: http://localhost:4000/print

종료는 `Ctrl+C`입니다. YAML·HTML·SCSS는 자동으로 다시 빌드되지만,
`_config.yml` 변경 후에는 서버를 재시작합니다.
화면과 출력 페이지를 함께 확인합니다.

서버는 기본적으로 `127.0.0.1`에 바인딩합니다. WSL에서 Windows localhost 접속이
되지 않는 경우 서버 실행 여부와 Windows/WSL 네트워크 설정을 확인합니다.
다른 기기에서 접근할 때만 `--host 0.0.0.0` 옵션을 사용합니다.

### 문제 해결

| 증상 | 확인 및 조치 |
| --- | --- |
| `bundle: command not found` | 사용자 gem PATH 설정 후 `gem install bundler --user-install` |
| `Could not locate Gemfile` | 저장소 루트로 이동 |
| gem 또는 webrick 관련 오류 | `bundle install` 후 `bundle exec`로 실행 |
| 4000 포트 사용 중 | `bundle exec jekyll serve --livereload --port 4001` |
| 수정이 보이지 않음 | 서버 종료 → `bundle exec jekyll clean` → 서버 재시작 → 브라우저 새로고침 |
| 설치 실패 원인 확인 | `ruby --version`, `bundle --version`, `bundle env` 확인 |

의존성 오류를 해결하려고 `Gemfile.lock`을 임의로 삭제하지 않습니다.

## 인쇄 및 PDF

상단의 `인쇄`와 `PDF`는 모두 `/print?dialog=1`을 엽니다.
폰트 로딩과 페이지 구성이 끝난 뒤 브라우저 인쇄 창을 호출합니다.
PDF는 인쇄 대상에서 **PDF로 저장**을 선택합니다. 자동 다운로드 기능은 아닙니다.
자동 인쇄 창이 열리지 않으면 미리보기 상단의 출력 버튼을 누릅니다.

출력 구성:

1. 경력을 첫 페이지에 배치합니다.
2. 주요 업무 및 프로젝트는 새 페이지에서 시작합니다.
3. 회사별 큰 프로젝트 묶음은 새 페이지에서 시작합니다.
4. 프로젝트를 가능한 한 한 페이지 안에 유지합니다.
5. 한 프로젝트가 한 장보다 길면 목록 항목 단위로 나누고 제목과 분류를 반복합니다.
6. 설명 한 항목이나 경력 문단 자체가 한 장보다 길면, 실제 높이를 재측정하면서
   들어가는 문자열 범위를 찾아 다음 페이지로 이어갑니다. 텍스트는 생략하지 않습니다.

`print.js`는 실제 글꼴과 줄바꿈으로 측정한 높이를 사용합니다.
`.print-sheet`는 A4(210 × 297mm), 안쪽 여백은 사방 12mm입니다.
용지의 `@page` 여백은 0이므로 브라우저의 자동 날짜·문서 제목·URL이 들어갈
바깥 여백을 없애고, 본문 여백은 각 출력 페이지 내부에서 반복합니다.

인쇄 설정은 **A4 / 배율 100% / 여백 없음**을 사용합니다.
브라우저나 프린터가 자체 머리글·바닥글 또는 사용자 여백을 강제하면
해당 옵션도 꺼야 합니다. 용지 크기나 배율을 바꾸면 미리보기와 달라질 수 있습니다.
종이 출력은 프린터의 비인쇄 영역에 영향을 받을 수 있습니다.

`/print`는 자동 인쇄 없이 구성된 페이지를 확인하는 주소입니다.
페이지 수나 프로젝트별 페이지 번호는 고정하지 않습니다. 글꼴 로딩 후 측정하므로
내용·줄바꿈·글자 크기가 바뀌면 페이지 수도 다시 계산됩니다.
제목·회사 정보 자체가 한 페이지를 넘는 경우에는 출력 준비 오류를 표시합니다.
한 장보다 긴 경력 문단을 문자열 단위로 나눌 때는 해당 문단의 인라인 서식이
일반 텍스트로 변환됩니다. 출력 화면은 JavaScript가 필요합니다.
경력 설명의 자동 분할은 문단과 목록을 지원합니다. 한 장보다 긴 경력 설명에
표나 별도 제목이 포함되면 내용을 누락시키지 않고 오류를 표시합니다.

## 검증과 배포

개발 서버를 종료한 뒤 실행합니다.

```bash
bundle exec jekyll clean
JEKYLL_ENV=production bundle exec jekyll build
bundle exec ruby scripts/check.rb
git diff --check
```

검사 스크립트는 생성물의 필수 섹션·프로젝트 수·로컬 파일 참조·불필요한 배포 파일을
확인합니다. 미사용 include·최상위 데이터 키·자산, SCSS import 누락,
중복 HTML ID도 검사합니다. 현재 정적 자산은 HTML에서 직접 참조하는 구조입니다.
CSS 배경 이미지나 JavaScript 동적 자산을 추가하면 검사 스크립트에도 참조를 반영합니다.
실제 인쇄 페이지 나눔은 브라우저에서 확인해야 합니다.

브라우저에서 데스크톱/모바일 화면, 인쇄 페이지의 상단 여백과 제목·본문 연결,
PDF의 날짜·URL 미표시를 확인합니다.
원본 파일을 커밋하고 GitHub에 push하면 저장소의 GitHub Pages 배포 설정에 따라 빌드됩니다.
배포 완료 여부는 GitHub의 Actions/Pages에서 확인합니다.
`_site/`은 push하지 않습니다. 별도 배포용 워크플로는 이 저장소에 포함하지 않습니다.

사이트를 하위 경로에 배포한다면 `_config.yml`의 `baseurl`을 변경합니다.
정적 파일과 출력 링크는 `relative_url`을 통해 이 경로를 반영합니다.
CSS와 JavaScript URL에는 빌드 시각을 붙여 이전 파일 캐시가 남는 것을 줄입니다.

