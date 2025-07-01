"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Search,
    Book,
    Filter,
    Star,
    Calendar,
    FileText,
    Building,
    Users,
    Globe,
    Hash,
    MessageSquare,
    BookOpen,
    UserCheck,
    Heart,
    Eye,
    CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import type { BookObj } from "../interfaces";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Hook de debounce genérico
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function BookTree() {
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<BookObj[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDescription, setCurrentDescription] = useState("");

    // Estados de busca
    const [searchIsbn13, setSearchIsbn13] = useState("");
    const [searchIsbn10, setSearchIsbn10] = useState("");
    const [searchTitulo, setSearchTitulo] = useState("");
    const [searchAutor, setSearchAutor] = useState("");
    const [searchIdioma, setSearchIdioma] = useState("");
    const [searchEditora, setSearchEditora] = useState("");
    const [searchGenero, setSearchGenero] = useState("");
    const [searchDescricao, setSearchDescricao] = useState("");

    // Debounced values
    const debouncedIsbn13 = useDebounce(searchIsbn13, 500);
    const debouncedIsbn10 = useDebounce(searchIsbn10, 500);
    const debouncedTitulo = useDebounce(searchTitulo, 500);
    const debouncedAutor = useDebounce(searchAutor, 500);
    const debouncedIdioma = useDebounce(searchIdioma, 500);
    const debouncedEditora = useDebounce(searchEditora, 500);
    const debouncedGenero = useDebounce(searchGenero, 500);
    const debouncedDescricao = useDebounce(searchDescricao, 500);

    // Estados para intervalos
    const [anoRange, setAnoRange] = useState<[number, number]>([1800, 2024]);
    const [paginasRange, setPaginasRange] = useState<[number, number]>([
        0, 1000,
    ]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
    const [avaliacaoRange, setAvaliacaoRange] = useState<[number, number]>([
        0, 5000,
    ]);
    const [resenhaRange, setResenhaRange] = useState<[number, number]>([
        0, 1000,
    ]);
    const [abandonosRange, setAbandonosRange] = useState<[number, number]>([
        0, 500,
    ]);
    const [relendoRange, setRelendoRange] = useState<[number, number]>([
        0, 1000,
    ]);
    const [queremLerRange, setQueremLerRange] = useState<[number, number]>([
        0, 10000,
    ]);
    const [lendoRange, setLendoRange] = useState<[number, number]>([0, 1000]);
    const [leramRange, setLeramRange] = useState<[number, number]>([0, 20000]);
    const [maleRange, setMaleRange] = useState<[number, number]>([0, 10000]);
    const [femaleRange, setFemaleRange] = useState<[number, number]>([
        0, 10000,
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
    const [hasNextPage, setHasNextPage] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        debouncedIsbn13,
        debouncedIsbn10,
        debouncedTitulo,
        debouncedAutor,
        debouncedIdioma,
        debouncedEditora,
        debouncedGenero,
        debouncedDescricao,
        anoRange,
        paginasRange,
        ratingRange,
        avaliacaoRange,
        resenhaRange,
        abandonosRange,
        relendoRange,
        queremLerRange,
        lendoRange,
        leramRange,
        maleRange,
        femaleRange,
    ]);

    useEffect(() => {
        async function fetchBooks() {
            setIsLoading(true);
            try {
                const { data } = await axios.get<{
                    page: number;
                    pageSize: number;
                    results: BookObj[];
                    hasNextPage: boolean;
                }>("http://localhost:3000/books/search", {
                    params: {
                        isbn13: debouncedIsbn13,
                        isbn10: debouncedIsbn10,
                        titulo: debouncedTitulo,
                        autor: debouncedAutor,
                        idioma: debouncedIdioma,
                        editora: debouncedEditora,
                        genero: debouncedGenero,
                        descricao: debouncedDescricao,
                        anoMin: anoRange[0],
                        anoMax: anoRange[1],
                        paginasMin: paginasRange[0],
                        paginasMax: paginasRange[1],
                        ratingMin: ratingRange[0],
                        ratingMax: ratingRange[1],
                        avaliacaoMin: avaliacaoRange[0],
                        avaliacaoMax: avaliacaoRange[1],
                        resenhaMin: resenhaRange[0],
                        resenhaMax: resenhaRange[1],
                        abandonosMin: abandonosRange[0],
                        abandonosMax: abandonosRange[1],
                        relendoMin: relendoRange[0],
                        relendoMax: relendoRange[1],
                        queremLerMin: queremLerRange[0],
                        queremLerMax: queremLerRange[1],
                        lendoMin: lendoRange[0],
                        lendoMax: lendoRange[1],
                        leramMin: leramRange[0],
                        leramMax: leramRange[1],
                        maleMin: maleRange[0],
                        maleMax: maleRange[1],
                        femaleMin: femaleRange[0],
                        femaleMax: femaleRange[1],
                        page: currentPage, // aqui sim usa o page dinâmico
                        pageSize,
                    },
                });
                setBooks(data.results);
                setHasNextPage(data.hasNextPage);
            } catch (error) {
                console.error("Erro ao buscar livros:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBooks();
    }, [
        debouncedIsbn13,
        debouncedIsbn10,
        debouncedTitulo,
        debouncedAutor,
        debouncedIdioma,
        debouncedEditora,
        debouncedGenero,
        debouncedDescricao,
        anoRange,
        paginasRange,
        ratingRange,
        avaliacaoRange,
        resenhaRange,
        abandonosRange,
        relendoRange,
        queremLerRange,
        lendoRange,
        leramRange,
        maleRange,
        femaleRange,
        currentPage, // só aqui
    ]);

    // Filtra em memória para destacar contagem etc.
    const filteredBooks = useMemo(() => {
        return books;
    }, [books]);

    const clearFilters = () => {
        setSearchIsbn13("");
        setSearchIsbn10("");
        setSearchTitulo("");
        setSearchAutor("");
        setSearchIdioma("");
        setSearchEditora("");
        setSearchGenero("");
        setSearchDescricao("");
        setAnoRange([1800, 2024]);
        setPaginasRange([0, 1000]);
        setRatingRange([0, 5]);
        setAvaliacaoRange([0, 5000]);
        setResenhaRange([0, 1000]);
        setAbandonosRange([0, 500]);
        setRelendoRange([0, 1000]);
        setQueremLerRange([0, 10000]);
        setLendoRange([0, 1000]);
        setLeramRange([0, 20000]);
        setMaleRange([0, 10000]);
        setFemaleRange([0, 10000]);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="w-full sm:px-6 lg:px-8 py-4 align-middle justify-center items-center">
                    <div className="flex justify-center items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Book className="h-8 w-8 text-emerald-600" />
                            <h1 className="text-2xl font-bold text-gray-900">
                                BookTree
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar de Filtros */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Filter className="h-5 w-5" />
                                        Filtros
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}>
                                        Limpar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Seção de Busca por Texto */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-gray-700">
                                        Busca por Texto
                                    </h4>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            ISBN-13
                                        </Label>
                                        <Input
                                            placeholder="Digite o ISBN-13..."
                                            value={searchIsbn13}
                                            onChange={(e) =>
                                                setSearchIsbn13(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            ISBN-10
                                        </Label>
                                        <Input
                                            placeholder="Digite o ISBN-10..."
                                            value={searchIsbn10}
                                            onChange={(e) =>
                                                setSearchIsbn10(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Search className="h-4 w-4" />
                                            Título
                                        </Label>
                                        <Input
                                            id='titulo'
                                            placeholder="Digite o título..."
                                            value={searchTitulo}
                                            onChange={(e) =>
                                                setSearchTitulo(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Autor
                                        </Label>
                                        <Input
                                            id='autor'
                                            placeholder="Digite o autor..."
                                            value={searchAutor}
                                            onChange={(e) =>
                                                setSearchAutor(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" />
                                            Idioma
                                        </Label>
                                        <Input
                                            placeholder="Digite o idioma..."
                                            value={searchIdioma}
                                            onChange={(e) =>
                                                setSearchIdioma(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Editora
                                        </Label>
                                        <Input
                                            placeholder="Digite a editora..."
                                            value={searchEditora}
                                            onChange={(e) =>
                                                setSearchEditora(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Descrição
                                        </Label>
                                        <Textarea
                                            placeholder="Buscar na descrição..."
                                            value={searchDescricao}
                                            onChange={(e) =>
                                                setSearchDescricao(
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Seção de Filtros por Intervalo */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-gray-700">
                                        Filtros por Intervalo
                                    </h4>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Ano de Publicação
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={anoRange}
                                                onValueChange={(value) =>
                                                    setAnoRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={1800}
                                                max={2024}
                                                step={1}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{anoRange[0]}</span>
                                                <span>{anoRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Número de Páginas
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={paginasRange}
                                                onValueChange={(value) =>
                                                    setPaginasRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={0}
                                                max={1000}
                                                step={10}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{paginasRange[0]}</span>
                                                <span>{paginasRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            Rating
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={ratingRange}
                                                onValueChange={(value) =>
                                                    setRatingRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={0}
                                                max={5}
                                                step={0.1}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>
                                                    {ratingRange[0].toFixed(1)}
                                                </span>
                                                <span>
                                                    {ratingRange[1].toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4" />
                                            Avaliações
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={avaliacaoRange}
                                                onValueChange={(value) =>
                                                    setAvaliacaoRange([
                                                        value[0],
                                                        value[1],
                                                    ] as [number, number])
                                                }
                                                min={0}
                                                max={5000}
                                                step={50}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{avaliacaoRange[0]}</span>
                                                <span>{avaliacaoRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Resenhas
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={resenhaRange}
                                                onValueChange={(value) =>
                                                    setResenhaRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={0}
                                                max={1000}
                                                step={10}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{resenhaRange[0]}</span>
                                                <span>{resenhaRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Querem Ler
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={queremLerRange}
                                                onValueChange={(value) =>
                                                    setQueremLerRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={0}
                                                max={10000}
                                                step={100}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{queremLerRange[0]}</span>
                                                <span>{queremLerRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Lendo
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={lendoRange}
                                                onValueChange={(value) =>
                                                    setLendoRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={0}
                                                max={1000}
                                                step={10}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{lendoRange[0]}</span>
                                                <span>{lendoRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Leram
                                        </Label>
                                        <div className="px-2">
                                            <Slider
                                                value={leramRange}
                                                onValueChange={(value) =>
                                                    setLeramRange([
                                                        value[0],
                                                        value[1],
                                                    ])
                                                }
                                                min={0}
                                                max={20000}
                                                step={100}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{leramRange[0]}</span>
                                                <span>{leramRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {isLoading ? (
                        <div className="lg:col-span-3 flex items-center justify-center py-12">
                            carregando
                        </div>
                    ) : (
                        <div className="lg:col-span-3">
                            {!filteredBooks || filteredBooks.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Book className="h-16 w-16 text-gray-400" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Nenhum livro encontrado
                                            </h3>
                                            <p className="text-gray-500">
                                                Tente ajustar os filtros para
                                                encontrar mais resultados.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredBooks.map((book) => (
                                        <Card
                                            key={book.id}
                                            id={book.isbn13}
                                            className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {book.titulo}
                                                    </h3>
                                                </div>
                                                <h4 className="text-gray-600 mb-3">
                                                    {book.autor}
                                                </h4>

                                                <div className="space-y-2 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{book.ano}</span>
                                                        <span>•</span>
                                                        <FileText className="h-4 w-4" />
                                                        <span>
                                                            {book.paginas}{" "}
                                                            páginas
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4" />
                                                        <span>
                                                            {book.editora}
                                                        </span>
                                                        <span>•</span>
                                                        <Globe className="h-4 w-4" />
                                                        <span>
                                                            {book.idioma}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Hash className="h-4 w-4" />
                                                        <span className="text-xs">
                                                            {book.isbn13}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                                                        <div className="flex items-center gap-1">
                                                            <Heart className="h-3 w-3" />
                                                            <span>
                                                                {book.queremLer.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            <span>
                                                                {book.leram.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            <span>
                                                                {book.lendo}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            <span>
                                                                {book.resenha}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">
                                                                {book.rating}
                                                            </span>
                                                            <span className="text-gray-400">
                                                                (
                                                                {book.avaliacao}
                                                                )
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={() => {
                                                                setCurrentDescription(
                                                                    book.descricao
                                                                );
                                                                setIsModalOpen(
                                                                    true
                                                                );
                                                            }}>
                                                            Ver Detalhes
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <Dialog
                        open={isModalOpen}
                        onOpenChange={setIsModalOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Descrição do Livro</DialogTitle>
                                <DialogDescription asChild>
                                    <p className="whitespace-pre-wrap">
                                        {currentDescription}
                                    </p>
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Fechar</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex justify-between px-80 py-4">
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}>
                        Anterior
                    </Button>
                    <p>{currentPage}</p>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                            hasNextPage && setCurrentPage((p) => p + 1)
                        }
                        disabled={!hasNextPage}>
                        Próxima
                    </Button>
                </div>
            </div>
        </div>
    );
}
