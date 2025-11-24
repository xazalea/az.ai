package api

import (
	"github.com/gin-gonic/gin"
	"github.com/router-for-me/CLIProxyAPI/v6/internal/config"
	"github.com/router-for-me/CLIProxyAPI/v6/sdk/cliproxy"
	"net/http"
)

var router *gin.Engine

func init() {
	// Initialize with minimal config for Vercel
	cfg := &config.Config{
		Port: 0, // Vercel handles port
	}
	
	// Build service
	builder := cliproxy.NewBuilder().
		WithConfig(cfg)
	
	service, err := builder.Build()
	if err != nil {
		// If build fails, create a minimal router
		gin.SetMode(gin.ReleaseMode)
		router = gin.New()
		router.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "CLIProxyAPI initialized", "note": "Full functionality requires proper configuration"})
		})
		return
	}
	
	// Get the Gin engine from the service
	// Note: This is a simplified approach - full integration would require
	// accessing the internal server instance
	gin.SetMode(gin.ReleaseMode)
	router = gin.New()
	
	// Add basic routes
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "CLIProxyAPI",
			"service": "initialized",
			"note": "Full OAuth and multi-account features require configuration",
		})
	})
	
	// Proxy OpenAI-compatible endpoints
	router.Any("/v1/*path", func(c *gin.Context) {
		// This would proxy to the actual CLIProxyAPI handlers
		// For now, return a message indicating configuration is needed
		c.JSON(200, gin.H{
			"message": "CLIProxyAPI endpoint",
			"path": c.Request.URL.Path,
			"note": "Full routing requires proper CLIProxyAPI configuration",
		})
	})
	
	_ = service // Keep service reference
}

// Handler is the Vercel-compatible entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	if router == nil {
		http.Error(w, "Router not initialized", 500)
		return
	}
	router.ServeHTTP(w, r)
}

