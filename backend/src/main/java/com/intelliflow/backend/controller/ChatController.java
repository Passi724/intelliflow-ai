package com.intelliflow.backend.controller;

import com.intelliflow.backend.dto.ChatAnswerResponse;
import com.intelliflow.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final DocumentService documentService;

    @GetMapping
    public ChatAnswerResponse chat(@RequestParam("q") String query) {
        return documentService.chat(query);
    }
}
