package gvk.projects.cms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "customer")
@NamedEntityGraph(
    name = "Customer.withDetails",
    attributeNodes = {
        @NamedAttributeNode("phoneNumbers"),
        @NamedAttributeNode(value = "addresses", subgraph = "address-subgraph"),
        @NamedAttributeNode("familyMembers")
    },
    subgraphs = {
        @NamedSubgraph(
            name = "address-subgraph",
            attributeNodes = {
                @NamedAttributeNode("city"),
                @NamedAttributeNode("country")
            }
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"phoneNumbers", "addresses", "familyMembers"})

public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @EqualsAndHashCode.Include
    @Column(name = "nic_number", nullable = false, unique = true, length = 20)
    private String nicNumber;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PhoneNumber> phoneNumbers = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Address> addresses = new HashSet<>();

    // Self-referential many-to-many for family members
    @ManyToMany
    @JoinTable(
        name = "customer_family",
        joinColumns = @JoinColumn(name = "customer_id"),
        inverseJoinColumns = @JoinColumn(name = "family_member_id")
    )
    private Set<Customer> familyMembers = new HashSet<>();
}
