FROM ghcr.io/cirruslabs/flutter:latest

WORKDIR /home/mobile
COPY . .

RUN flutter build apk --release

RUN mkdir ../apk

CMD cp build/app/outputs/flutter-apk/* ../apk/