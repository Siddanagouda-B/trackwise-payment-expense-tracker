package com.trackwise.expense.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record OverviewDto(BigDecimal income, BigDecimal expenses, BigDecimal balance,
                          int transactionCount, List<Map<String, Object>> categoryBreakdown) {}
