# cargo

## Environment variables:
- **`PORT`**: The port on which the application will run.
- **`NODE_ENV`**: The environment in which the application is running (`development`, `homolog`, or `production`).
- **`RABBITMQ_URL`**: The connection string used to connect to the RabbitMQ broker.
- **`MSSQL_SA_PASSWORD`**: The password used to access the Microsoft SQL Server instance (set during the Docker setup).
- **`DATABASE_URL`**: The connection string to Microsoft SQL Server instance.
  - If running the application locally, use a local instance.
  - If running through Docker, use the SQL Server container instance.

The password in the connection string should match the one set in the `MSSQL_SA_PASSWORD` environment variable.

## Setting up SQL Server (Docker)
To setup the SQL Server container, it's necessary to install the `sqlcmd` utility to execute SQL scripts through the command line. To do this, we'll install the utility inside the SQL Server container. With the container running (`docker compose up -d`), execute the following command:

```
docker exec -u 0 -it sql-server bash
```

This command will start a shell session in the container with root privileges.

### Step 1: Install `sqlcmd`
Update the system and install the utility:

```
apt-get update && apt-get install -y curl apt-transport-https && \
curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
apt-get update && ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev
```

### Step 2: Update the PATH
Append `sqlcmd` to the system's PATH variable:

```
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Restart the Container
Exit the container and restart it to apply the changes:

```
exit
docker restart sql-server
```

### Step 4: Verify `sqlcmd` Path
Access the SQL Server container again and check the proper `sqlcmd` utility path (the path might vary in some cases):

```
docker exec -it sql-server bash
ls /opt/mssql-tools/bin/sqlcmd
```

### Step 5: Access SQL Server and Create a Database
You can now access the SQL Server container and use `sqlcmd` (passing the SQL Server instance credentials):

```
docker exec -it sql-server /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P <sql-sa-password> [-C]
```

Run the following SQL script to create a new database:

```
CREATE DATABASE <database-name>;
GO
USE <database-name>;
GO
```

### Step 6: Run Prisma Migrations and Seed (Locally)
Once the database is created, run the Prisma migrations and seed locally:

```
npx prisma migrate dev
npx prisma db seed
```

- `migrate dev` applies any pending database schema changes.
- `db seed` runs the seed script to populate the database with initial data.

Make sure that, at this step, the `DATABASE_URL` connection string in your `.env` file points to the **mapped port** outside the container (`localhost:1435`), not the internal container port (`sql-server:1433`).
