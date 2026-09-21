# 로컬 개발 가이드

이 문서는 Windows WSL 2의 Ubuntu에서 `online-cv` 기반 Jekyll 사이트를 개발하고, 로컬 테스트 페이지를 확인하는 방법을 설명한다. 명령은 Windows PowerShell이 아닌 **WSL Ubuntu 터미널**에서 실행한다.

## 프로젝트 구성

- 이력서 내용: `_data/data.yml`
- 사이트 주소, 제목, 색상 테마: `_config.yml`
- 페이지 구성: `_includes/`, `_layouts/`
- 스타일: `_sass/`, `assets/css/`
- 일반 페이지: `index.html`
- 인쇄용 페이지: `print.html`
- 정적 빌드 결과: `_site/`

`_site/`은 Jekyll이 생성하는 결과물이므로 직접 수정하거나 Git에 커밋하지 않는다.

## 빠른 실행

최초 환경 설정을 완료한 뒤에는 다음 명령으로 개발 서버를 실행한다.

```bash
cd /home/user/myrepos/gyeongsik97.github.io
bundle exec jekyll serve --livereload
```

Windows 브라우저에서 <http://localhost:4000>을 연다. 인쇄용 화면은 <http://localhost:4000/print>에서 확인한다. 종료할 때는 서버를 실행한 터미널에서 `Ctrl+C`를 누른다.

## 최초 1회 환경 설정

### 1. 저장소 위치

파일 감시와 빌드 성능을 위해 저장소는 `/mnt/c`가 아닌 WSL의 Linux 파일 시스템에 둔다.

```bash
cd /home/user/myrepos/gyeongsik97.github.io
pwd
```

다른 위치에 저장소를 두었다면 이후 명령의 경로를 실제 위치로 바꾼다.

### 2. Ruby와 빌드 도구 설치

다음 명령은 `sudo` 비밀번호 입력이 필요하므로 WSL Ubuntu 터미널에서 직접 실행한다.

```bash
sudo apt update
sudo apt install -y ruby-full build-essential zlib1g-dev
```

설치를 확인한다.

```bash
ruby --version
gem --version
gcc --version
make --version
```

각 명령이 버전을 출력해야 한다. Jekyll은 Ruby 2.7 이상을 요구한다.

### 3. 사용자 전용 gem 실행 경로 설정

Ruby gem은 시스템 경로에 `sudo`로 설치하지 않고 사용자 홈에 설치한다. 사용자용 gem 실행 파일을 찾을 수 있도록 아래 설정을 한 번만 실행한다.

```bash
grep -qxF '# User-installed Ruby executables' ~/.bashrc || printf '%s\n' \
  '# User-installed Ruby executables' \
  'export PATH="$(ruby -r rubygems -e '\''puts Gem.user_dir'\'')/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

설정 결과를 확인한다.

```bash
ruby -r rubygems -e 'puts Gem.user_dir'
```

`/home/<사용자명>/.local/share/gem/ruby/<Ruby API 버전>` 형식의 경로가 출력되어야 한다.

### 4. Bundler와 프로젝트 의존성 설치

```bash
gem install bundler --user-install
cd /home/user/myrepos/gyeongsik97.github.io
bundle install
```

Jekyll은 프로젝트의 `Gemfile`에 포함되어 있으므로 별도로 `gem install jekyll`을 실행하지 않는다. 설치를 확인한다.

```bash
bundle exec jekyll --version
```

## 로컬 테스트 페이지 실행

저장소 루트에서 다음 명령을 실행한다.

```bash
cd /home/user/myrepos/gyeongsik97.github.io
bundle exec jekyll serve --livereload
```

다음과 비슷한 메시지가 나오면 실행된 것이다.

```text
Server address: http://127.0.0.1:4000/
Server running... press ctrl-c to stop.
```

Windows 브라우저에서 다음 주소를 연다.

- 일반 페이지: <http://localhost:4000>
- 인쇄용 페이지: <http://localhost:4000/print>

WSL 2의 localhost 전달 기능을 통해 Windows 브라우저에서 바로 접속할 수 있다. 서버는 실행한 터미널에서 `Ctrl+C`를 눌러 종료한다.

`_data/data.yml`, HTML, SCSS 변경은 자동으로 다시 빌드되고 브라우저가 새로고침된다. `_config.yml` 변경은 서버를 종료한 뒤 다시 실행해야 확실하게 반영된다.

## 터미널에서 동작 확인

개발 서버가 실행 중인 상태에서 새 WSL 터미널을 열고 다음 명령을 실행한다.

```bash
curl --fail --head http://localhost:4000
curl --fail --head http://localhost:4000/print
```

두 명령 모두 `HTTP/1.1 200 OK`를 반환하면 정상이다.

## 배포 전 검사

개발 서버를 `Ctrl+C`로 종료한 뒤 production 환경으로 정적 사이트를 빌드한다.

```bash
cd /home/user/myrepos/gyeongsik97.github.io
bundle exec jekyll clean
JEKYLL_ENV=production bundle exec jekyll build
```

오류 없이 `_site/`이 생성되면 배포 가능한 상태다. 생성물을 실제 서버 방식으로 확인하려면 다음 명령을 사용한다.

```bash
JEKYLL_ENV=production bundle exec jekyll serve --no-watch
```

Windows 브라우저에서 <http://localhost:4000>을 확인하고 `Ctrl+C`로 종료한다.

## 평소 작업 순서

환경 설정을 마친 뒤에는 다음 흐름만 반복한다.

```bash
cd /home/user/myrepos/gyeongsik97.github.io
bundle exec jekyll serve --livereload
```

1. `_data/data.yml`에서 경력서 내용을 수정한다.
2. <http://localhost:4000>에서 일반 화면을 확인한다.
3. <http://localhost:4000/print>에서 인쇄 화면을 확인한다.
4. 서버를 종료하고 production 빌드를 검사한다.
5. 변경 내용을 커밋하고 GitHub에 push한다.

## 외부 기기에서 접속

같은 네트워크의 다른 기기에서 확인할 필요가 있을 때만 모든 네트워크 인터페이스에 서버를 연다.

```bash
bundle exec jekyll serve --livereload --host 0.0.0.0
```

WSL IP는 다음 명령으로 확인한다.

```bash
hostname -I
```

이 방식은 Windows 방화벽 설정이 추가로 필요할 수 있으며 로컬 네트워크에 개발 서버가 노출된다. 일반 개발에서는 기본 localhost 실행을 사용한다.

## 문제 해결

### `ruby: command not found`

```bash
sudo apt update
sudo apt install -y ruby-full build-essential zlib1g-dev
```

### `bundle: command not found`

먼저 사용자용 gem 실행 경로가 등록되어 있는지 확인한다.

```bash
grep -F 'Gem.user_dir' ~/.bashrc
```

아무 내용도 출력되지 않으면 다음 설정을 추가한다.

```bash
printf '%s\n' \
  '# User-installed Ruby executables' \
  'export PATH="$(ruby -r rubygems -e '\''puts Gem.user_dir'\'')/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Bundler가 아직 설치되지 않은 경우에만 설치하고 버전을 확인한다.

```bash
gem install bundler --user-install
bundle --version
```

### `Could not locate Gemfile`

저장소 루트로 이동한 뒤 실행한다.

```bash
cd /home/user/myrepos/gyeongsik97.github.io
bundle install
```

### `cannot load such file -- webrick`

현재 프로젝트는 `webrick`을 의존성으로 포함한다. 의존성을 다시 설치한다.

```bash
bundle install
```

### 4000번 포트가 이미 사용 중임

다른 포트로 실행한다.

```bash
bundle exec jekyll serve --livereload --port 4001
```

브라우저에서는 <http://localhost:4001>로 접속한다.

### 변경 내용이 반영되지 않음

서버를 종료한 뒤 캐시와 빌드 결과를 정리하고 다시 실행한다.

```bash
bundle exec jekyll clean
bundle exec jekyll serve --livereload
```

브라우저에서도 `Ctrl+F5`로 강력 새로고침한다.

### 의존성 설치 또는 빌드 오류

먼저 설치 도구와 현재 상태를 기록한다.

```bash
ruby --version
gem --version
bundle --version
bundle env
```

`Gemfile.lock`을 임의로 삭제하기 전에 오류 메시지와 위 정보를 확인한다. 의존성 전체 업데이트는 사이트 결과가 달라질 수 있으므로 별도 변경으로 진행한다.

## 참고 문서

- [Jekyll의 Ubuntu 설치 안내](https://jekyllrb.com/docs/installation/ubuntu/)
- [GitHub Pages 사이트를 로컬에서 테스트하기](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)
- [online-cv 원본 저장소](https://github.com/sharu725/online-cv)
