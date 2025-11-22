# Astrophysics Equation Solver Web App

## Project Description

This web application provides astrophysicists and enthusiasts a powerful tool to input, solve, and visualize astrophysics differential equations. It combines a Python Flask backend with symbolic math (SymPy), a PHP-based user authentication system, a modern JavaScript frontend with WebAssembly acceleration for computationally intensive solvers, and responsive HTML5 visualization.

### Features

- User registration, login, and session management with PHP and MySQL
- Flask REST API for equation parsing and solving using SymPy and WebAssembly
- High-performance WebAssembly module for astrophysics equation solving (compiled from C)
- Interactive input form for differential equations
- Dynamic graph rendering via HTML5 Canvas with zoom and pan
- Responsive design with Bootstrap 5
- Dockerized multi-service deployment

## Prerequisites

- Docker (for containerized setup) or
- Python 3.8+ installed locally
- PHP 7.4+ with Apache and PDO MySQL extension
- Node.js 14+ and npm/yarn (for frontend build)
- MySQL or compatible database server

## Installation

### 1. Clone the repository

