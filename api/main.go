package main

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"

	b64 "encoding/base64"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/weaviate/weaviate-go-client/v4/weaviate"
	"github.com/weaviate/weaviate-go-client/v4/weaviate/graphql"
	"github.com/weaviate/weaviate/entities/models"
)

func DeleteClass(ctx context.Context, client *weaviate.Client) error {
	return client.Schema().ClassDeleter().WithClassName("MultiModal").Do(ctx)
}

func CreateClass(ctx context.Context, client *weaviate.Client) error {
	multiModal := &models.Class{
		Class:       "MultiModal",
		Description: "Sample class holding all the images",
		ModuleConfig: map[string]interface{}{
			"img2vec-neural": map[string]interface{}{
				"imageFields": []string{"image"},
			},
		},
		VectorIndexType: "hnsw",
		Vectorizer:      "img2vec-neural",
		Properties: []*models.Property{
			{
				DataType:    []string{"string"},
				Description: "The name of the file",
				Name:        "filename",
			},
			{
				DataType:    []string{"blob"},
				Description: "Base64 encoded image",
				Name:        "image",
			},
		},
	}
	return client.Schema().ClassCreator().WithClass(multiModal).Do(ctx)
}

func ImportObjects(ctx context.Context, client *weaviate.Client) error {
	basePath := "./img"
	files, err := ioutil.ReadDir(basePath)
	if err != nil {
		return err
	}

	for _, f := range files {
		data, err := ioutil.ReadFile(fmt.Sprintf("%s/%s", basePath, f.Name()))
		if err != nil {
			return err
		}
		image := b64.StdEncoding.EncodeToString([]byte(data))
		object := &models.Object{
			Class: "MultiModal",
			Properties: map[string]interface{}{
				"filename": f.Name(),
				"image":    image,
			},
		}
		batcher := client.Batch().ObjectsBatcher()
		batcher.WithObject(object)
		resp, err := batcher.Do(ctx)
		if err != nil {
			return err
		}
		if len(resp) != 1 {
			return errors.New("not all objects imported")
		}
	}

	return nil
}

func SearchImage(ctx context.Context, client *weaviate.Client, img string) ([16]string, error) {
	var images [16]string

	data, err := ioutil.ReadFile(img)
	if err != nil {
		println(err)
		return images, err
	}
	image := b64.StdEncoding.EncodeToString([]byte(data))
	fields := []graphql.Field{
		{Name: "image"},
	}
	res, err := client.GraphQL().Get().WithClassName("MultiModal").WithNearImage(client.GraphQL().NearImageArgBuilder().WithImage(image)).WithLimit(16).WithFields(fields...).Do(ctx)
	if err != nil {
		println(err)
		return images, err
	}
	type to = map[string]interface{}
	type ls = []interface{}
	type e = interface{}
	type n = string
	for i, d := range res.Data["Get"].(to)["MultiModal"].(ls) {
		img := d.(to)["image"].(e).(n)
		images[i] = img
	}
	return images, nil
}

func main() {
	ctx := context.Background()

	cfg := weaviate.Config{
		Host:   "localhost:8080",
		Scheme: "http",
	}
	client := weaviate.New(cfg)

	app := gin.Default()
	app.Use(cors.Default())
	app.GET("/ping", func(c *gin.Context) { c.JSON(200, "pong") })
	search := app.Group("/search")
	{
		search.POST("/image", func(c *gin.Context) {
			body, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				c.String(400, "Invalid")
				return
			}
			defer c.Request.Body.Close()

			id := uuid.NewString()
			filename := fmt.Sprintf("./static/%v.jpg", id)

			file, _ := os.Create(filename)
			defer file.Close()
			file.Write(body)

			images, err := SearchImage(ctx, client, filename)
			if err != nil {
				println(err)
				c.String(500, "Invalid")
				return
			}

			c.JSON(200, images)
		})
	}
	app.Run(":8085")
	return
}
