FROM ubuntu:18.10

ENV pyenv_version v1.2.17
RUN apt-get update && apt-get install -y \
        curl \
        git \
        gcc \
        build-essential \
        python3 \
        bash \
        python3-dev \
        tar \
        gzip \
        && rm -rf /var/lib/apt/lists/*

ENV pyenv_root_name pyenv-${pyenv_version}
ENV PYENV_ROOT /action/.pyenv@${pyenv_version}
ENV tarball_filename ${pyenv_version}.tar.gz
ENV tarball_path /build/${pyenv_version}.tar.gz
ENV pyenv_tarball_url https://github.com/pyenv/pyenv/archive/$tarball_filename



RUN mkdir -p /action /build
ENV PATH "${PYENV_ROOT}/bin:${PATH}"
ENV HOME "/build"

WORKDIR /build

RUN git clone https://github.com/pyenv/pyenv.git "${PYENV_ROOT}"

RUN pyenv install 3.6.4
RUN pyenv install 3.7.3
RUN pyenv local 3.6.4
RUN python --version
