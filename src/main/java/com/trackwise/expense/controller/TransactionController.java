package com.trackwise.expense.controller;

import com.trackwise.expense.dto.OverviewDto;
import com.trackwise.expense.model.Transaction;
import com.trackwise.expense.repository.TransactionRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class TransactionController {
    private final TransactionRepository repository;
    public TransactionController(TransactionRepository repository) { this.repository = repository; }

    public record TransactionRequest(
            @NotBlank @Size(max=100) String title,
            @NotBlank @Size(max=60) String category,
            @NotBlank String type,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @NotNull LocalDate transactionDate,
            @Size(max=300) String note,
            @Size(max=40) String paymentMethod) {}

    @GetMapping("/transactions")
    public List<Transaction> all() { return repository.findAllByOrderByTransactionDateDescIdDesc(); }

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@Valid @RequestBody TransactionRequest request) {
        validateType(request.type());
        return repository.save(new Transaction(request.title().trim(), request.category(),
                request.type().toUpperCase(Locale.ROOT), request.amount(), request.transactionDate(),
                request.note(), request.paymentMethod()));
    }

    @PutMapping("/transactions/{id}")
    public Transaction update(@PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        validateType(request.type());
        Transaction item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        item.setTitle(request.title().trim()); item.setCategory(request.category());
        item.setType(request.type().toUpperCase(Locale.ROOT)); item.setAmount(request.amount());
        item.setTransactionDate(request.transactionDate()); item.setNote(request.note());
        item.setPaymentMethod(request.paymentMethod());
        return repository.save(item);
    }

    @DeleteMapping("/transactions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
        repository.deleteById(id);
    }

    @GetMapping("/overview")
    public OverviewDto overview() {
        List<Transaction> rows = repository.findAll();
        BigDecimal income = sum(rows, "INCOME");
        BigDecimal expenses = sum(rows, "EXPENSE");
        Map<String, BigDecimal> byCategory = rows.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));
        List<Map<String, Object>> breakdown = byCategory.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .map(e -> { Map<String,Object> m = new LinkedHashMap<>(); m.put("category",e.getKey()); m.put("amount",e.getValue()); return m; })
                .toList();
        return new OverviewDto(income, expenses, income.subtract(expenses), rows.size(), breakdown);
    }

    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "UP", "application", "TrackWise API"); }

    private BigDecimal sum(List<Transaction> rows, String type) {
        return rows.stream().filter(t -> type.equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    private void validateType(String type) {
        if (!List.of("INCOME", "EXPENSE").contains(type.toUpperCase(Locale.ROOT)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be INCOME or EXPENSE");
    }
}
