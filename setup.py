#!/usr/bin/env python3
"""Setup script for AI Gateway CLI"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="ai-gateway-cli",
    version="1.0.0",
    author="AI Gateway CLI",
    description="A command-line interface for interacting with AI Gateway",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/ai-gateway-cli",
    py_modules=["ai_gateway_cli"],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=[
        "openai>=1.0.0",
    ],
    entry_points={
        "console_scripts": [
            "ai-gateway=ai_gateway_cli:main",
        ],
    },
)
