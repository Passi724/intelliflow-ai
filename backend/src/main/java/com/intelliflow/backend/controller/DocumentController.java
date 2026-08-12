package com.intelliflow.backend.controller;

import com.intelliflow.backend.dto.DocumentResponse;
import com.intelliflow.backend.dto.SearchResultResponse;
import com.intelliflow.backend.entity.User;
import com.intelliflow.backend.repository.UserRepository;
import com.intelliflow.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    @PostMapping
    public DocumentResponse upload(@RequestParam("file") MultipartFile file, Authentication authentication) {
        User uploader = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return documentService.upload(file, uploader);
    }

    @GetMapping
    public List<DocumentResponse> list() {
        return documentService.listAll();
    }

    @GetMapping("/search")
    public List<SearchResultResponse> search(@RequestParam("q") String query) {
        return documentService.search(query);
    }
}
