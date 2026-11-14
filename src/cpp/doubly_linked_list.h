// Doubly linked list with head and tail pointers.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
#pragma once
#include <vector>

class DoublyLinkedList {
public:
    struct Node {
        int value;
        Node* prev = nullptr;
        Node* next = nullptr;
        explicit Node(int v) : value(v) {}
    };

    DoublyLinkedList() = default;
    explicit DoublyLinkedList(const std::vector<int>& values) {
        for (int v : values) insertTail(v);
    }
    ~DoublyLinkedList() {
        while (head) {
            Node* next = head->next;
            delete head;
            head = next;
        }
    }
    DoublyLinkedList(const DoublyLinkedList&) = delete;
    DoublyLinkedList& operator=(const DoublyLinkedList&) = delete;

    // @op insert_head
    void insertHead(int value) {
        Node* node = new Node(value);   // @step create
        node->next = head;              // @step link_next
        if (head != nullptr) {          // @step check_empty
            head->prev = node;          // @step link_prev
        } else {
            tail = node;                // @step set_tail
        }
        head = node;                    // @step set_head
        length++;                       // @step done
    }
    // @endop

    // @op insert_tail
    void insertTail(int value) {
        Node* node = new Node(value);   // @step create
        node->prev = tail;              // @step link_prev
        if (tail != nullptr) {          // @step check_empty
            tail->next = node;          // @step link_next
        } else {
            head = node;                // @step set_head
        }
        tail = node;                    // @step set_tail
        length++;                       // @step done
    }
    // @endop

    // @op delete_value
    bool deleteValue(int value) {
        Node* curr = head;                                  // @step start
        while (curr != nullptr && curr->value != value) {   // @step loop
            curr = curr->next;                              // @step advance
        }
        if (curr == nullptr) {          // @step check_found
            return false;               // @step not_found
        }
        if (curr->prev != nullptr) {            // @step check_prev
            curr->prev->next = curr->next;      // @step bypass_prev
        } else {
            head = curr->next;                  // @step move_head
        }
        if (curr->next != nullptr) {            // @step check_next
            curr->next->prev = curr->prev;      // @step bypass_next
        } else {
            tail = curr->prev;                  // @step move_tail
        }
        delete curr;                            // @step release
        length--;
        return true;                            // @step done
    }
    // @endop

    std::vector<int> toVector() const {
        std::vector<int> out;
        for (Node* n = head; n; n = n->next) out.push_back(n->value);
        return out;
    }
    std::vector<int> toVectorReversed() const {
        std::vector<int> out;
        for (Node* n = tail; n; n = n->prev) out.push_back(n->value);
        return out;
    }

private:
    Node* head = nullptr;
    Node* tail = nullptr;
    int length = 0;
};
