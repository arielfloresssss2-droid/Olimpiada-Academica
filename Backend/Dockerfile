# Stage 1: Build .NET Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copiar archivos de proyecto y restaurar dependencias
COPY Backend.csproj ./
RUN dotnet restore

# Copiar el resto del código y compilar en Release
COPY . ./
RUN dotnet publish -c Release -o /app/out

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build-env /app/out .

# Variables de entorno por defecto
ENV ASPNETCORE_URLS=http://+:5006
EXPOSE 5006

ENTRYPOINT ["dotnet", "Backend.dll"]
