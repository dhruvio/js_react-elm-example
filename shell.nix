{ pkgs ? import <nixpkgs> {} }:

with pkgs;

let
  nowLibPath = stdenv.lib.makeLibraryPath [
    stdenv.cc.cc.lib
  ];
in
  stdenv.mkDerivation {
    name = "react-elm-example";
    buildInputs = [
      nodejs-8_x
    ];
    shellHook = ''
      #set up prompt
      source ~/.bashrc
      #install dependencies
      npm install
    '';
  }
