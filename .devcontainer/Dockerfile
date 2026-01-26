FROM mcr.microsoft.com/devcontainers/base:noble

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Install locales, zsh, sudo, curl, git, and other common utilities
RUN apt-get update && \
    apt-get install -y locales sudo curl git zsh wget apt-transport-https ca-certificates gnupg lsb-release software-properties-common && \
    locale-gen en_US.UTF-8 && \
    update-locale LANG=en_US.UTF-8

# Add user 'box' with UID and GID 1001
RUN groupadd -g 1001 box && \
    useradd -m -u 1001 -g 1001 -s /bin/zsh box && \
    echo "box ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install Oh My Zsh for user 'box'
USER box
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Set agnoster theme and plugins for zsh
RUN sed -i 's/ZSH_THEME=".*"/ZSH_THEME="agnoster"/' ~/.zshrc && \
    sed -i 's/plugins=(.*)/plugins=(git docker)/' ~/.zshrc

# Switch back to root for further installations
USER root

# Upgrade packages and install non-free packages
RUN apt-get update && apt-get upgrade -y

# Set up git config for user 'box'
USER box
RUN git config --global user.name 'Saulo Vallory' && \
    git config --global user.email 'me@saulo.engineer' && \
    git config --global pull.rebase true

# Install Homebrew for user 'box'
RUN NONINTERACTIVE=1 bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
ENV PATH="/home/box/.linuxbrew/bin:/home/box/.linuxbrew/sbin:${PATH}"

# Install proto for user 'box'
RUN curl -fsSL https://moonrepo.dev/install/proto.sh | bash -s -- --yes

# Add proto to PATH
ENV PATH="/home/box/.proto/bin:${PATH}"

# Switch to box user for proto and tool installs
USER box

# Set HOME and PROTO_HOME for box user
ENV HOME=/home/box
ENV PROTO_HOME=$HOME/.proto

# Set working directory
WORKDIR $HOME

# Install moon, node, bun, gh, infisical using proto
RUN proto install moon --pin global && \
    proto install node --pin global && \
    proto install bun --pin global && \
    proto plugin add gh 'https://raw.githubusercontent.com/appthrust/proto-toml-plugins/main/gh/plugin.toml' && \
    proto install gh --pin global && \
    proto plugin add infisical 'https://raw.githubusercontent.com/Phault/proto-toml-plugins/main/infisical/plugin.toml' && \
    proto install infisical --pin global

# Link .agent/AGENT.md to CLAUDE.md in /workspaces/rcl-tree-sitter
# RUN mkdir -p /workspaces/rcl-tree-sitter && \
#     ln -s /workspaces/rcl-tree-sitter/.agent/AGENT.md /workspaces/rcl-tree-sitter/CLAUDE.md || true

RUN bun i -g @anthropic-ai/claude-code

# Add Bun globals to box user's .zshrc
RUN echo '\n# Bun globals\nexport PATH="$HOME/.bun/bin:$PATH"' >> /home/box/.zshrc

# Set default user
USER box

# Set default shell
SHELL ["/bin/zsh", "-c"]

# Expose any ports if needed (uncomment and set as needed)
# EXPOSE 3000

# End of Dockerfile
