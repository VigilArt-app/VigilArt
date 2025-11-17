FROM ghcr.io/cirruslabs/flutter:latest

WORKDIR /home/mobile

COPY . .

RUN flutter pub get

RUN flutter doctor

RUN flutter build apk --release
