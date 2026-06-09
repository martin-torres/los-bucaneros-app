# Los Bucaneros - PocketBase Backend
FROM ghcr.io/muchobien/pocketbase:latest

# The pocketbase binary is already at /usr/local/bin/pocketbase
# Data directory should be mounted at /pb/pb_data

EXPOSE 8090

CMD ["serve", "--http=0.0.0.0:8090"]
