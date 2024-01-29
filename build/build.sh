docker build -t ezreal-code-doc:release .

docker stop   ezreal-code-doc
docker rm     ezreal-code-doc

docker run --name ezreal-code-doc -d -p 80:80 ezreal-code-doc:release
