package org.crypto.aiproject.controller;

import jakarta.annotation.PostConstruct;
import org.crypto.aiproject.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

/**
 * Image uploads. Files are stored on disk (a Docker volume in prod) and
 * served back under /api/uploads/** so they can be embedded in episode and
 * tutorial content.
 */
@RestController
public class UploadController {

    private static final Logger log = LoggerFactory.getLogger(UploadController.class);

    private static final Map<String, String> ALLOWED = Map.of(
            "png",  "image/png",
            "jpg",  "image/jpeg",
            "jpeg", "image/jpeg",
            "gif",  "image/gif",
            "webp", "image/webp"
    );

    private final Path uploadDir;

    public UploadController(@Value("${app.upload-dir:uploads}") String dir) {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(uploadDir);
        log.info("Upload directory ready: {}", uploadDir);
    }

    private static String extension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
    }

    /** POST /api/admin/upload — upload an image (ADMIN only). Returns the URL in the message field. */
    @PostMapping("/api/admin/upload")
    public ResponseEntity<ApiResponse> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "No file provided"));
        }
        String ext = extension(file.getOriginalFilename());
        if (!ALLOWED.containsKey(ext)) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Unsupported file type — use PNG, JPG, GIF or WebP."));
        }
        try {
            String name = UUID.randomUUID() + "." + ext;
            file.transferTo(uploadDir.resolve(name));
            log.info("ADMIN: image uploaded — {} ({} bytes)", name, file.getSize());
            return ResponseEntity.ok(new ApiResponse(true, "/api/uploads/" + name));
        } catch (IOException e) {
            log.error("Image upload failed", e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Upload failed: " + e.getMessage()));
        }
    }

    /** GET /api/uploads/{filename} — serve an uploaded image (public). */
    @GetMapping("/api/uploads/{filename}")
    public ResponseEntity<Resource> serve(@PathVariable String filename) {
        // Path-traversal guard: only a plain filename is allowed.
        if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) {
            return ResponseEntity.badRequest().build();
        }
        Path file = uploadDir.resolve(filename).normalize();
        if (!file.startsWith(uploadDir) || !Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }
        String contentType = ALLOWED.getOrDefault(extension(filename), "application/octet-stream");
        try {
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
