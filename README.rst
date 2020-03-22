pyenv-action
============



.. image:: https://img.shields.io/github/workflow/status/gabrielfalcao/pyenv-action/main
   :target: https://github.com/gabrielfalcao/pyenv-action/actions

.. image:: https://img.shields.io/github/license/gabrielfalcao/pyenv-action?label=Github%20License
   :target: https://github.com/gabrielfalcao/pyenv-action/blob/master/LICENSE

.. image:: https://img.shields.io/github/v/tag/gabrielfalcao/pyenv-action
   :target: https://github.com/gabrielfalcao/pyenv-action/releases

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
