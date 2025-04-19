FROM denoland/deno:1.40.2

WORKDIR /app

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Ensure the Deno cache is populated (prefetch dependencies)
RUN deno cache main.ts

# Set necessary environment variables
ENV ENCRYPTION_KEY="your-32-char-secure-key"
# You would normally set these via Docker secrets or environment variables in production
ENV JWT_SECRET="your-secret-key"

# Create a non-root user for security
RUN addgroup --system --gid 1001 deno && \
    adduser --system --uid 1001 --gid 1001 deno

# Set permissions for uploads directory
RUN chown -R deno:deno /app/uploads

# Use the non-root user
USER deno

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["run", "-A", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"]