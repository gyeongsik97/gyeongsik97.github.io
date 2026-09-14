# 로컬 개발 환경 구성

이 문서는 Windows WSL의 Ubuntu에서 `online-cv` 기반 Jekyll 사이트를 실행하고 브라우저로 확인하는 방법을 설명한다. 모든 명령은 Windows PowerShell이 아닌 **Ubuntu 터미널**에서 실행한다.

## 1. 저장소 위치 확인

가능하면 저장소를 `/mnt/c` 아래가 아닌 WSL의 Linux 파일 시스템(예: `~/myrepos`)에 둔다. 파일 감시와 빌드 성능이 더 안정적이다.

```bash
cd ~/myrepos/gyeongsik97.github.io
pwd
```

현재 저장소의 권장 위치는 다음과 같다.

```text
/home/<사용자명>/myrepos/gyeongsik97.github.io
```

## 2. Ruby와 빌드 도구 설치

Ubuntu 패키지 목록을 갱신하고 Ruby, 헤더 파일 및 네이티브 gem 컴파일 도구를 설치한다.

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

Jekyll의 현재 최소 요구사항에 맞춰 Ruby 2.7 이상을 사용한다. 아래 명령에서 `true`가 출력되어야 한다.

```bash
ruby -e 'puts Gem::Version.new(RUBY_VERSION) >= Gem::Version.new("2.7")'
```

## 3. 사용자 전용 gem 경로 설정

gem을 시스템 영역에 `sudo`로 설치하지 않는다. 사용자 홈 디렉터리에 설치되도록 Bash 환경을 한 번 설정한다.

```bash
echo '# User-installed Ruby gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

적용 여부를 확인한다.

```bash
gem env home
```

결과는 `/home/<사용자명>/gems` 형태여야 한다.

## 4. Bundler와 프로젝트 의존성 설치

Bundler를 설치한 다음 저장소에 선언된 gem을 설치한다. Jekyll은 프로젝트 의존성에 포함되므로 별도로 전역 설치할 필요가 없다.

```bash
gem install bundler
cd ~/myrepos/gyeongsik97.github.io
bundle install
```

설치가 끝나면 다음 명령으로 버전을 확인한다.

```bash
bundle exec jekyll --version
```

`Gemfile.lock`이 생성되면 커밋한다. 이 파일은 모든 개발 환경에서 동일한 gem 버전을 사용하게 해준다.

## 5. 로컬 페이지 실행

저장소 루트에서 개발 서버를 실행한다.

```bash
bundle exec jekyll serve --livereload
```

터미널에 `Server address`가 표시되면 Windows 브라우저에서 다음 주소를 연다.

```text
http://localhost:4000
```

WSL 2의 localhost 전달 기능을 통해 일반적으로 Windows 브라우저에서 바로 접속할 수 있다. 서버는 터미널에서 `Ctrl+C`를 눌러 종료한다.

SCSS, HTML, Markdown 등의 변경은 자동으로 다시 빌드된다. `_config.yml` 변경이 반영되지 않으면 서버를 종료한 뒤 다시 실행한다.

이력서 내용은 `_data/data.yml`에서 관리한다. 사이트 제목, 주소, 색상 테마 같은 전역 설정은 `_config.yml`에서 관리한다.

다른 기기에서도 접속해야 할 때만 다음과 같이 모든 인터페이스에 바인딩한다.

```bash
bundle exec jekyll serve --livereload --host 0.0.0.0
```

이 경우 Windows 방화벽과 네트워크 노출 범위를 별도로 확인해야 한다.

## 6. 배포 전 빌드 확인

개발 서버가 아닌 실제 정적 사이트 빌드가 성공하는지 검사한다.

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

생성 결과는 `_site/`에 저장된다. `_site/`는 빌드 산출물이므로 직접 수정하거나 Git에 커밋하지 않는다.

빌드 산출물까지 로컬 서버로 확인하려면 다음 명령을 사용할 수 있다.

```bash
bundle exec jekyll serve --detach
```

일반적인 개발에서는 종료가 명확한 `bundle exec jekyll serve --livereload` 사용을 권장한다.

## 7. 자주 발생하는 문제

### `ruby: command not found`

Ruby 설치 단계가 완료되지 않은 상태다.

```bash
sudo apt install -y ruby-full build-essential zlib1g-dev
```

### `bundle: command not found`

새 터미널을 열거나 `source ~/.bashrc`를 실행한 뒤 Bundler를 다시 설치한다.

```bash
source ~/.bashrc
gem install bundler
```

### `Could not locate Gemfile`

저장소 루트가 아닌 곳에서 실행한 경우다.

```bash
cd ~/myrepos/gyeongsik97.github.io
bundle install
```

### `cannot load such file -- webrick`

먼저 의존성을 다시 설치한다.

```bash
bundle install
```

그래도 같은 오류가 발생하면 Webrick을 프로젝트 의존성에 추가한다.

```bash
bundle add webrick
```

### `Address already in use` 또는 4000번 포트 충돌

다른 포트로 실행한다.

```bash
bundle exec jekyll serve --livereload --port 4001
```

브라우저에서는 `http://localhost:4001`로 접속한다.

### 변경 내용이 화면에 반영되지 않음

`_config.yml`을 수정했다면 서버를 재시작한다. 그 외 파일이라면 강력 새로고침(`Ctrl+F5`) 후에도 해결되지 않을 때 캐시 없이 다시 빌드한다.

```bash
bundle exec jekyll clean
bundle exec jekyll serve --livereload
```

## 8. 의존성 업데이트

의존성 업데이트는 사이트 표시 결과가 바뀔 수 있으므로 별도 작업으로 진행한다. 업데이트 후에는 반드시 로컬 서버와 production 빌드를 모두 확인한다.

```bash
bundle update github-pages
bundle exec jekyll serve --livereload
JEKYLL_ENV=production bundle exec jekyll build
```

## 참고 문서

- [Jekyll의 Ubuntu 설치 안내](https://jekyllrb.com/docs/installation/ubuntu/)
- [GitHub Pages 사이트를 로컬에서 테스트하기](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)
- [GitHub Pages gem](https://github.com/github/pages-gem)
