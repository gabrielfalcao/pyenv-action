pyenv-action
============

This GitHub Action can build python projects with pyenv support

Usage
-----

To start checking all pull requests, add the following file at
``.github/workflows/pyenv.yml``:

.. code:: yaml

   name: Test My Application
   on: [pull_request]
   jobs:
     pyenv:
       runs-on: ubuntu-latest
       name: Check
       steps:
       - uses: actions/checkout@v1
       - name: Bento
         uses: gabrielfalcao/pyenv-action@v1
         with:
           default: 3.7.3
           commands:
             - pip install -U pip
             - pip install -U setuptools

           versions:
             - 3.6.5
             - 3.7.3

       - name: Run tests on python 3.6.5
         run: |
           pyenv local 3.6.5 && make tests

       - name: Run tests on python 3.7.3
         run: |
           pyenv local 3.6.5 && make tests
