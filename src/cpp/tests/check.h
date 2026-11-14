// Tiny test helpers: CHECK records failures, finish() reports and sets the exit code.
#pragma once
#include <iostream>

inline int& failures() {
    static int n = 0;
    return n;
}

#define CHECK(cond)                                                              \
    do {                                                                         \
        if (!(cond)) {                                                           \
            std::cerr << __FILE__ << ":" << __LINE__ << ": CHECK failed: " #cond \
                      << "\n";                                                   \
            failures()++;                                                        \
        }                                                                        \
    } while (0)

inline int finish(const char* name) {
    if (failures()) {
        std::cerr << name << ": " << failures() << " failure(s)\n";
        return 1;
    }
    std::cout << name << ": OK\n";
    return 0;
}
