FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN mkdir -p /app/history && chown -R bun:bun /app/history

USER bun

VOLUME /app/history

# Run the bot
CMD ["bun", "run", "./src/index.ts"]